import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for parsed orders (in production, use a database or cache like Redis)
// Key: sessionId, Value: parsed orders data
// Note: In serverless environments (Vercel), this is ephemeral and will reset on each cold start
// For production, consider using Supabase or Redis for persistent storage
const parsedOrdersStore = new Map<string, {
  items: any[];
  receivedAt: Date;
}>();

// Clean up old entries (older than 1 hour)
// Note: setInterval doesn't work in serverless environments, so cleanup happens on-demand
// For production, use a scheduled job or database TTL
function cleanupOldEntries() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [sessionId, data] of parsedOrdersStore.entries()) {
    if (data.receivedAt < oneHourAgo) {
      parsedOrdersStore.delete(sessionId);
    }
  }
}

export async function POST(request: NextRequest) {
  console.log('=== RECEIVE PARSED ORDERS API CALLED ===');
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  // Clean up old entries before processing
  cleanupOldEntries();
  
  try {
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error('Failed to parse JSON body:', e);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        received_body: rawBody.substring(0, 500),
      }, { status: 400 });
    }
    
    console.log('Parsed body:', JSON.stringify(body, null, 2));
    console.log('Body keys:', Object.keys(body));

    // Extract session ID from request (Zapier should send this)
    // If not provided, generate one or use a default
    const sessionId = body.session_id || body.sessionId || body['session_id'] || 'default';
    console.log('Extracted session_id:', sessionId);
    
    // Extract parsed items from Zapier response
    // Zapier ChatGPT might return data in different formats, so we need to handle various structures
    let items: any[] = [];
    
    console.log('Attempting to extract items from body...');
    
    // First, try to get items array directly
    if (Array.isArray(body)) {
      console.log('Body is an array, using directly');
      items = body;
    } else if (body.items && Array.isArray(body.items)) {
      console.log('Found body.items array');
      items = body.items;
    } else if (body.data && Array.isArray(body.data)) {
      console.log('Found body.data array');
      items = body.data;
    } else if (body.orders && Array.isArray(body.orders)) {
      console.log('Found body.orders array');
      items = body.orders;
    } else if (body.item_quantities && body.venue_name) {
      // If it's a single order object (new format), wrap it
      console.log('Found single order object, wrapping in array');
      items = [body];
    } else if (typeof body === 'object' && body !== null) {
      // Check if it has order-like fields
      if (body.order_id || body.client_name || body.venue_name) {
        console.log('Found order-like object, wrapping in array');
        items = [body];
      } else {
        // Try to find nested data
        console.log('Trying to find nested data...');
        for (const key of Object.keys(body)) {
          if (Array.isArray(body[key]) && body[key].length > 0) {
            console.log(`Found array at body.${key}`);
            items = body[key];
            break;
          }
        }
      }
    }

    // If ChatGPT returned a string, try to parse it as JSON
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        if (Array.isArray(parsed)) {
          items = parsed;
        } else if (parsed.items) {
          items = parsed.items;
        }
      } catch (e) {
        console.error('Failed to parse string response:', e);
      }
    }

    // If we still don't have items, check for ChatGPT response format
    if (items.length === 0 && body.choices && body.choices[0] && body.choices[0].message) {
      const messageContent = body.choices[0].message.content;
      try {
        const parsed = JSON.parse(messageContent);
        if (Array.isArray(parsed)) {
          items = parsed;
        } else if (parsed.items) {
          items = parsed.items;
        }
      } catch (e) {
        console.error('Failed to parse ChatGPT message content:', e);
      }
    }

    console.log(`Extracted ${items.length} items`);
    
    if (items.length === 0) {
      console.warn('❌ No items found in Zapier response!');
      console.warn('Full body structure:', JSON.stringify(body, null, 2));
      console.warn('Body type:', typeof body);
      console.warn('Body keys:', Object.keys(body));
      
      // Store empty array with session ID so polling can see it was received
      parsedOrdersStore.set(sessionId, {
        items: [],
        receivedAt: new Date(),
      });
      
      return NextResponse.json({
        success: false,
        error: 'No items found in response',
        received_data: body,
        body_keys: Object.keys(body),
        body_type: typeof body,
      }, { status: 400 });
    }

    // Store the parsed orders
    parsedOrdersStore.set(sessionId, {
      items,
      receivedAt: new Date(),
    });

    console.log(`✅ Stored ${items.length} parsed items for session ${sessionId}`);
    console.log('Items preview:', JSON.stringify(items.slice(0, 2), null, 2));

    return NextResponse.json({
      success: true,
      message: `Received ${items.length} parsed order(s)`,
      session_id: sessionId,
      items_count: items.length,
    });
  } catch (error) {
    console.error('Receive parsed orders API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve parsed orders for a session
export async function GET(request: NextRequest) {
  // Clean up old entries before retrieving
  cleanupOldEntries();
  
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id') || 'default';
  
  console.log(`GET request for session_id: ${sessionId}`);
  console.log('Available sessions:', Array.from(parsedOrdersStore.keys()));

  const data = parsedOrdersStore.get(sessionId);
  
  if (!data) {
    console.log(`❌ No data found for session_id: ${sessionId}`);
    return NextResponse.json({
      success: false,
      error: 'No parsed orders found for this session',
      requested_session_id: sessionId,
      available_sessions: Array.from(parsedOrdersStore.keys()),
    }, { status: 404 });
  }

  console.log(`✅ Found data for session_id: ${sessionId}, items count: ${data.items.length}`);
  
  return NextResponse.json({
    success: true,
    items: data.items,
    received_at: data.receivedAt.toISOString(),
  });
}

// DELETE endpoint to clear parsed orders for a session
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id') || 'default';

  parsedOrdersStore.delete(sessionId);

  return NextResponse.json({
    success: true,
    message: 'Parsed orders cleared',
  });
}

