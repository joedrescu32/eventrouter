import { NextRequest, NextResponse } from 'next/server';

const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/25456946/uzp4aen/';

export async function POST(request: NextRequest) {
  console.log('=== SEND TO WEBHOOK API CALLED ===');
  
  try {
    // Get session ID from header
    const sessionId = request.headers.get('x-session-id') || `session-${Date.now()}`;
    console.log('Session ID:', sessionId);
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`Received ${files.length} file(s) to send to webhook`);

    const results = [];
    const errors = [];

    // Send each file to Zapier webhook
    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name} (${file.size} bytes)`);
        
        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        
        // Send to webhook
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            filetype: file.type,
            filesize: file.size,
            file_data: base64,
            uploaded_at: new Date().toISOString(),
            session_id: sessionId,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Webhook returned ${response.status}: ${errorText}`);
        }

        // Zapier webhooks typically return a simple success response
        const result = await response.json().catch(() => ({ status: 'success' }));
        console.log(`✅ Successfully sent ${file.name} to webhook:`, result);
        results.push({ 
          filename: file.name, 
          success: true, 
          webhook_response: result 
        });
      } catch (error) {
        console.error(`❌ Error sending ${file.name}:`, error);
        errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Send to webhook API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

