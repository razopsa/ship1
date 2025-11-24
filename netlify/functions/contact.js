import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async (req, context) => {
  // Handle CORS and method check
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'All fields are required'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid email format'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
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
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('client-ip') || 'unknown',
          user_agent: req.headers.get('user-agent')
        }
      ])
      .select();

    const { data, error } = await Promise.race([
      insertPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase timeout')), 5000)
      )
    ]);

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to submit contact form. Please try again later.',
          error: error.message
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        data: data[0]
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An error occurred while processing your request',
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};
