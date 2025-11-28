import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { trackingDatabase } from './netlify/functions/trackingDatabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Environment validation on startup
function validateEnvironment() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('⚠️  Contact form will fail without these variables');
  } else {
    console.log('✅ All required environment variables configured');
  }
}

// Supabase schema validation
async function validateSupabaseSchema() {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .limit(0);

    if (error) {
      console.error('❌ Supabase schema validation failed:', error.message);
      console.error('   Make sure "contact_submissions" table exists in your database');
      return false;
    }

    console.log('✅ Supabase schema validated - contact_submissions table exists');
    return true;
  } catch (err) {
    console.error('❌ Failed to validate Supabase schema:', err.message);
    return false;
  }
}

// Run validations on startup
validateEnvironment();
validateSupabaseSchema().catch(err => {
  console.error('Schema validation error:', err);
});

// Routes

// Health check with diagnostics
app.get('/api/health', (req, res) => {
  const health = {
    status: 'API is running',
    timestamp: new Date(),
    environment: {
      supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  };
  res.json(health);
});

// Track shipment
app.post('/api/track', (req, res) => {
  const { trackingNumber } = req.body;

  if (!trackingNumber) {
    return res.status(400).json({
      success: false,
      message: 'Tracking number is required'
    });
  }

  const normalized = trackingNumber.trim().toUpperCase();
  const shipment = trackingDatabase[normalized];

  if (shipment) {
    return res.status(200).json({
      success: true,
      data: shipment
    });
  } else {
    return res.status(404).json({
      success: false,
      message: `No shipment found for tracking number: ${normalized}`
    });
  }
});

// Get all available tracking numbers (for testing)
app.get('/api/available-tracking', (req, res) => {
  const trackingNumbers = Object.keys(trackingDatabase);
  res.json({
    success: true,
    message: 'Available tracking numbers for testing:',
    data: trackingNumbers
  });
});

// Test endpoint - basic connectivity
app.post('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test endpoint works', body: req.body });
});

// Comprehensive diagnostics endpoint
app.get('/api/diagnostics', async (req, res) => {
  console.log('📊 Running diagnostics...');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    server: {
      running: true,
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    },
    environment: {
      supabaseUrlSet: !!process.env.SUPABASE_URL,
      supabaseKeySet: !!process.env.SUPABASE_ANON_KEY
    },
    supabase: {
      connected: false,
      tableExists: false,
      error: null
    },
    endpoints: {
      track: '/api/track (POST)',
      contact: '/api/contact (POST)',
      health: '/api/health (GET)',
      diagnostics: '/api/diagnostics (GET)'
    }
  };

  // Test Supabase connection
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .limit(0);

    if (error) {
      diagnostics.supabase.error = error.message;
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      diagnostics.supabase.connected = true;
      diagnostics.supabase.tableExists = true;
      console.log('✅ Supabase connected and table exists');
    }
  } catch (err) {
    diagnostics.supabase.error = err.message;
    console.error('❌ Supabase test failed:', err.message);
  }

  res.json(diagnostics);
});

// Contact form test endpoint
app.post('/api/contact-test', async (req, res) => {
  console.log('🧪 Testing contact form submission...');

  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    subject: 'Test Submission',
    message: 'This is a test contact form submission to verify the endpoint is working.'
  };

  try {
    // Validate environment
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Supabase not configured',
        test: 'failed'
      });
    }

    // Try to submit
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ Test submission failed:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Test submission failed',
        error: error.message,
        test: 'failed'
      });
    }

    if (!data || data.length === 0) {
      console.error('❌ Test submission returned empty response');
      return res.status(500).json({
        success: false,
        message: 'Test submission returned empty response',
        test: 'failed'
      });
    }

    console.log('✅ Test submission successful');
    res.json({
      success: true,
      message: 'Test contact submission successful',
      test: 'passed',
      recordId: data[0].id
    });
  } catch (err) {
    console.error('❌ Test submission error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Test submission error',
      error: err.message,
      test: 'failed'
    });
  }
});

// Submit contact form with fallback logging
app.post('/api/contact', async (req, res) => {
  const timestamp = new Date().toISOString();
  const contactLog = {
    timestamp,
    ip: req.ip,
    userAgent: req.get('user-agent')
  };

  console.log(`📨 [${timestamp}] Contact form request received from ${req.ip}`);

  try {
    const { name, email, phone, subject, message } = req.body;

    contactLog.formData = {
      name: name?.substring(0, 50),
      email,
      phone: phone?.substring(0, 20),
      subject,
      messageLength: message?.length || 0
    };

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      console.warn(`⚠️  [${timestamp}] Validation failed - missing required fields`);
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        timestamp
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn(`⚠️  [${timestamp}] Email validation failed for: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        timestamp
      });
    }

    console.log(`✓ [${timestamp}] All validations passed for ${email}`);

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error(`❌ [${timestamp}] Supabase not configured - cannot submit form`);
      return res.status(503).json({
        success: false,
        message: 'Database service temporarily unavailable',
        timestamp
      });
    }

    // Insert into Supabase with timeout
    const insertPromise = supabase
      .from('contact_submissions')
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
          ip_address: req.ip,
          user_agent: req.get('user-agent')
        }
      ])
      .select();

    console.log(`🔄 [${timestamp}] Sending to Supabase...`);

    const { data, error } = await Promise.race([
      insertPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase timeout after 5000ms')), 5000)
      )
    ]);

    if (error) {
      console.error(`❌ [${timestamp}] Supabase error:`, error.message);
      console.error('   Error code:', error.code);
      console.error('   Error details:', error.details);

      // Log to fallback (file/console for now)
      console.error('   FALLBACK LOG: Contact submission failed for', {
        email,
        timestamp,
        errorMessage: error.message
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to submit contact form. Please try again later.',
        timestamp,
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code
        } : undefined
      });
    }

    if (!data || data.length === 0) {
      console.warn(`⚠️  [${timestamp}] Supabase returned empty response for ${email}`);
      return res.status(500).json({
        success: false,
        message: 'Form submitted but could not confirm receipt',
        timestamp
      });
    }

    console.log(`✅ [${timestamp}] Contact form submitted successfully for ${email}`);
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      timestamp,
      data: {
        id: data[0].id,
        email: data[0].email,
        submittedAt: data[0].created_at
      }
    });
  } catch (err) {
    console.error(`❌ [${timestamp}] Unexpected error:`, err.message);
    console.error('   Stack:', err.stack);

    // Fallback logging for unexpected errors
    console.error('   FALLBACK LOG: Unexpected error in contact submission', {
      timestamp,
      errorMessage: err.message,
      errorStack: err.stack?.substring(0, 200)
    });

    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      timestamp,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// 404 handler for API routes and SPA fallback
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }
  // SPA fallback - serve index.html for all non-API routes
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Tracking API Server running on http://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}`);
  console.log('\n📍 Available Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  GET  http://localhost:${PORT}/api/diagnostics`);
  console.log(`  POST http://localhost:${PORT}/api/track`);
  console.log(`  GET  http://localhost:${PORT}/api/available-tracking`);
  console.log(`  POST http://localhost:${PORT}/api/contact`);
  console.log(`  POST http://localhost:${PORT}/api/contact-test`);
  console.log(`  POST http://localhost:${PORT}/api/test`);
  console.log(`${'='.repeat(60)}\n`);
});