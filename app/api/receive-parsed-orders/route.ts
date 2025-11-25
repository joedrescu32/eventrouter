import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for parsed orders (in production, use a database or cache like Redis)
// Key: sessionId, Value: parsed orders data
const parsedOrdersStore = new Map<string, {
  items: any[];
  receivedAt: Date;
}>();

// Clean up old entries (older than 1 hour)
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [sessionId, data] of parsedOrdersStore.entries()) {
    if (data.receivedAt < oneHourAgo) {
      parsedOrdersStore.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

export async function POST(request: NextRequest) {
  console.log('=== RECEIVE PARSED ORDERS API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Received parsed orders from Zapier:', JSON.stringify(body, null, 2));

    // Extract session ID from request (Zapier should send this)
    // If not provided, generate one or use a default
    const sessionId = body.session_id || body.sessionId || 'default';
    
    // Extract parsed items from Zapier response
    // Zapier ChatGPT might return data in different formats, so we need to handle various structures
    let items: any[] = [];
    
    if (Array.isArray(body)) {
      items = body;
    } else if (body.items && Array.isArray(body.items)) {
      items = body.items;
    } else if (body.data && Array.isArray(body.data)) {
      items = body.data;
    } else if (body.orders && Array.isArray(body.orders)) {
      items = body.orders;
    } else if (typeof body === 'object') {
      // If it's a single object, wrap it in an array
      items = [body];
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

    if (items.length === 0) {
      console.warn('No items found in Zapier response. Full body:', JSON.stringify(body, null, 2));
      return NextResponse.json({
        success: false,
        error: 'No items found in response',
        received_data: body,
      }, { status: 400 });
    }

    // Store the parsed orders
    parsedOrdersStore.set(sessionId, {
      items,
      receivedAt: new Date(),
    });

    console.log(`✅ Stored ${items.length} parsed items for session ${sessionId}`);

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
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id') || 'default';

  const data = parsedOrdersStore.get(sessionId);
  
  if (!data) {
    return NextResponse.json({
      success: false,
      error: 'No parsed orders found for this session',
    }, { status: 404 });
  }

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

