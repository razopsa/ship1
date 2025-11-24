import { trackingDatabase } from './trackingDatabase.js';

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
    const { trackingNumber } = body;

    if (!trackingNumber) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Tracking number is required'
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

    const normalized = trackingNumber.trim().toUpperCase();
    const shipment = trackingDatabase[normalized];

    if (shipment) {
      return new Response(
        JSON.stringify({
          success: true,
          data: shipment
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: `No shipment found for tracking number: ${normalized}`
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An error occurred',
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
