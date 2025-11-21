import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

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
app.use(express.static(path.join(__dirname, 'dist')));

// Tracking Database (simulated)
const trackingDatabase = {
  '30944SX22STP885': {
    number: '30944SX22STP885',
    status: 'In Transit',
    origin: 'Istanbul, Turkey',
    destination: 'Sparks, Nevada, USA',
    expectedDelivery: '2025-11-25',
    actualDelivery: null,
    weight: '4.8 kg',
    service: 'Global Precious Cargo Transport',
    type: 'Precious Rocks & Geological Specimens',
    insurance: 'Yes - Full Coverage ($150,000)',
    recipient: 'Lorna Hayes, Sparks, Nevada',
    carrier: 'Emirates, Lufthansa, United Cargo',
    events: [
      {
        date: '2025-10-13',
        location: 'Istanbul, Turkey (IST/SAW)',
        desc: 'Shipment of precious rocks received and authenticated at Istanbul cargo terminal',
        status: 'Received'
      },
      {
        date: '2025-10-14',
        location: 'Istanbul, Turkey',
        desc: 'Full gemological analysis and valuation completed - $150,000 coverage approved',
        status: 'Valuation Complete'
      },
      {
        date: '2025-10-15',
        location: 'Istanbul Sabiha Gökçen Airport (SAW)',
        desc: 'Loaded onto Emirates Flight EK123 - Secure acceptance and customs documentation completed',
        status: 'In Transit'
      },
      {
        date: '2025-10-16',
        location: 'Dubai International Airport (DXB)',
        desc: 'Arrived Dubai hub - Transferred to Lufthansa secure cargo facility - All seals verified intact',
        status: 'Transit Hub'
      },
      {
        date: '2025-10-17',
        location: 'Dubai (DXB)',
        desc: 'UAE customs clearance completed - Export documentation finalized and approved',
        status: 'Customs Cleared'
      },
      {
        date: '2025-10-18',
        location: 'Dubai → Frankfurt',
        desc: 'Loaded onto Lufthansa Flight LH534 for Frankfurt with full armored security protocol',
        status: 'In Transit'
      },
      {
        date: '2025-10-19',
        location: 'Frankfurt Airport (FRA)',
        desc: 'Arrived Frankfurt - Transferred to secure U.S. customs pre-clearance facility',
        status: 'Customs Processing'
      },
      {
        date: '2025-10-20',
        location: 'Frankfurt (FRA)',
        desc: 'U.S. Customs pre-clearance completed - Loaded onto Lufthansa Flight LH441 for Chicago',
        status: 'In Transit'
      },
      {
        date: '2025-10-21',
        location: 'Chicago O\'Hare International Airport (ORD)',
        desc: 'Arrived U.S. - Primary customs entry point. Full inspection completed - all seals intact and contents verified',
        status: 'Customs Cleared'
      },
      {
        date: '2025-10-22',
        location: 'Chicago (ORD)',
        desc: 'Transferred to Brinks Secure Vault Facility for 2-week storage under 24/7 armored guard and insurance monitoring',
        status: 'Secure Storage'
      },
      {
        date: '2025-10-23',
        location: 'Chicago Secure Vault (Brinks)',
        desc: 'Storage day 1 - Shipment in secure vault with GPS monitoring and daily condition reports active',
        status: 'In Vault Storage'
      },
      {
        date: '2025-11-05',
        location: 'Chicago O\'Hare (ORD)',
        desc: 'Removed from vault - Final security inspection completed. Loaded onto United Cargo Flight UA1024 to Reno (with connection)',
        status: 'In Transit'
      },
      {
        date: '2025-11-06',
        location: 'En Route Chicago → Denver → Reno',
        desc: 'In flight - Real-time GPS tracking and armored courier escort monitoring active throughout journey',
        status: 'Armored Transit'
      },
      {
        date: '2025-11-13',
        location: 'Reno-Tahoe International Airport (RNO)',
        desc: 'Arrived Reno - Customs final clearance completed. Ready for armored ground delivery to Sparks',
        status: 'Final Delivery Stage'
      },
      {
        date: '2025-11-22',
        location: 'Reno-Tahoe International Airport (RNO)',
        desc: 'Final preparation completed - Shipment prepared for ground delivery to Sparks',
        status: 'Ready for Delivery'
      },
      {
        date: '2025-11-24',
        location: 'En Route to Sparks, Nevada',
        desc: 'Armored delivery vehicle departed from RNO with certified security escorts - Real-time GPS monitoring active',
        status: 'In Final Transit'
      },
      {
        date: '2025-11-25',
        location: 'Sparks, Nevada - Lorna Hayes residence',
        desc: 'Expected arrival and delivery - Recipient Lorna Hayes to sign and confirm receipt of precious cargo',
        status: 'Scheduled Delivery'
      }
    ]
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
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

// Submit contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Insert into Supabase
    const { data, error } = await supabase
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

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit contact form. Please try again later.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: data[0]
    });
  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
});

// SPA fallback
app.use((req, res) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found'
    });
  }
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

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Tracking API Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Track endpoint: POST http://localhost:${PORT}/api/track`);
  console.log(`📋 Available tracking numbers: GET http://localhost:${PORT}/api/available-tracking`);
  console.log(`📧 Contact form submission: POST http://localhost:${PORT}/api/contact\n`);
});
