import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import { trackingDatabase } from './data/trackingDatabase.js';
import { initializeDatabase, submitContactForm, testContactSubmission, getSchemaStatus } from './db/database.js';

const { Pool } = pkg;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize database on startup
let dbReady = false;
initializeDatabase(pool).then(() => {
  dbReady = true;
  console.log('✅ PostgreSQL database initialized');
}).catch(err => {
  console.error('❌ Database initialization failed:', err.message);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Environment validation on startup
function validateEnvironment() {
  const required = ['DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('⚠️  Database connection will fail without these variables');
  } else {
    console.log('✅ All required environment variables configured');
  }
}

// Run validations on startup
validateEnvironment();

// Routes

// Health check with diagnostics
app.get('/api/health', (req, res) => {
  const health = {
    status: 'API is running',
    timestamp: new Date(),
    environment: {
      databaseConfigured: !!process.env.DATABASE_URL,
      databaseReady: dbReady,
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
      databaseUrlSet: !!process.env.DATABASE_URL
    },
    database: {
      connected: false,
      tableExists: false,
      error: null
    },
    endpoints: {
      track: '/api/track (POST)',
      contact: '/api/contact (POST)',
      health: '/api/health (GET)',
      diagnostics: '/api/diagnostics (GET)',
      contactTest: '/api/contact-test (POST)'
    }
  };

  // Test database connection
  try {
    const schemaStatus = await getSchemaStatus(pool);
    if (schemaStatus.connected) {
      diagnostics.database.connected = true;
      diagnostics.database.tableExists = schemaStatus.tableExists;
      console.log('✅ PostgreSQL connected');
      if (schemaStatus.tableExists) {
        console.log('✅ contact_submissions table exists');
      } else {
        console.warn('⚠️  contact_submissions table does not exist');
      }
    } else {
      diagnostics.database.error = schemaStatus.error;
      console.error('❌ Database connection failed:', schemaStatus.error);
    }
  } catch (err) {
    diagnostics.database.error = err.message;
    console.error('❌ Database test failed:', err.message);
  }

  res.json(diagnostics);
});

// Contact form test endpoint
app.post('/api/contact-test', async (req, res) => {
  console.log('🧪 Testing contact form submission...');

  try {
    // Validate database
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({
        success: false,
        message: 'Database not configured',
        test: 'failed'
      });
    }

    // Try to submit test data
    const result = await testContactSubmission(pool, {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      subject: 'Test Submission',
      message: 'This is a test contact form submission to verify the endpoint is working.'
    });

    if (result.success) {
      console.log('✅ Test submission successful');
      res.json({
        success: true,
        message: 'Test contact submission successful',
        test: 'passed',
        recordId: result.recordId
      });
    } else {
      console.error('❌ Test submission failed:', result.error);
      res.status(500).json({
        success: false,
        message: 'Test submission failed',
        error: result.error,
        test: 'failed'
      });
    }
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

    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      console.error(`❌ [${timestamp}] Database not configured - cannot submit form`);
      return res.status(503).json({
        success: false,
        message: 'Database service temporarily unavailable',
        timestamp
      });
    }

    console.log(`🔄 [${timestamp}] Submitting to PostgreSQL database...`);

    // Submit to database
    const result = await submitContactForm(pool, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    if (!result.success) {
      console.error(`❌ [${timestamp}] Database error:`, result.error);

      // Log to fallback
      console.error('   FALLBACK LOG: Contact submission failed for', {
        email,
        timestamp,
        errorMessage: result.error
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to submit contact form. Please try again later.',
        timestamp,
        error: process.env.NODE_ENV === 'development' ? result.error : undefined
      });
    }

    console.log(`✅ [${timestamp}] Contact form submitted successfully for ${email}`);
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      timestamp,
      data: {
        id: result.recordId,
        email: email,
        submittedAt: result.submittedAt
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