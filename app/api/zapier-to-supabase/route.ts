import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// This route receives data from Zapier and writes it to Supabase
// Use this if you don't want to use Code by Zapier
export async function POST(request: NextRequest) {
  console.log('=== ZAPIER TO SUPABASE API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Received from Zapier:', JSON.stringify(body, null, 2));

    const sessionId = body.session_id || body.sessionId || 'default';
    
    // Extract items from Zapier/ChatGPT output
    let items: any[] = [];
    const chatgptOutput = body.items || body.data || body.chatgpt_output || body.message || body.content || body;
    
    try {
      const parsed = typeof chatgptOutput === 'string' ? JSON.parse(chatgptOutput) : chatgptOutput;
      
      if (Array.isArray(parsed)) {
        items = parsed;
      } else if (parsed.items && Array.isArray(parsed.items)) {
        items = parsed.items;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        items = parsed.data;
      } else if (typeof parsed === 'object' && parsed !== null) {
        items = [parsed];
      }
    } catch (e) {
      console.error('Error parsing ChatGPT output:', e);
      items = [chatgptOutput];
    }

    if (items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No items found in request',
      }, { status: 400 });
    }

    // Insert into Supabase
    // @ts-ignore - Database types are generic
    const { data, error } = await supabase
      .from('parsed_orders')
      // @ts-ignore - Database types are generic
      .insert({
        session_id: sessionId,
        items: items,
        processed: false,
      })
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    console.log(`✅ Successfully inserted ${items.length} items into Supabase for session ${sessionId}`);

    return NextResponse.json({
      success: true,
      message: `Inserted ${items.length} items`,
      session_id: sessionId,
      items_count: items.length,
    });
  } catch (error) {
    console.error('Zapier to Supabase API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

