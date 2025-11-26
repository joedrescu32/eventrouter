import { NextRequest, NextResponse } from 'next/server';
import FormData from 'form-data';
import axios from 'axios';

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
        
        // Get the file as a raw Buffer (do NOT convert to Blob)
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        
        // Create FormData using form-data package (not native FormData)
        const form = new FormData();
        
        // Append file as raw Buffer with filename (no options object)
        // Simple format: field name, buffer, filename
        form.append('file', fileBuffer, file.name);
        
        // Get headers from FormData (critical - includes Content-Type with boundary)
        const formHeaders = form.getHeaders();
        console.log('Form headers from getHeaders():', formHeaders);
        
        // Merge session ID header with form headers
        // IMPORTANT: formHeaders must come first (includes Content-Type with boundary)
        const headers = {
          ...formHeaders,
          'X-Session-ID': sessionId,  // Session ID in header - becomes {{335651859__headers__x-session-id}} in Zapier
        };
        console.log('Final headers being sent:', headers);
        
        // Use axios instead of fetch - axios handles form-data streams correctly in serverless
        const response = await axios.post(
          WEBHOOK_URL,
          form,  // form-data package
          { headers: headers }
        );

        console.log(`✅ Successfully sent ${file.name} to webhook:`, response.data);
        const result = response.data;
        results.push({ 
          filename: file.name, 
          success: true, 
          webhook_response: result 
        });
      } catch (error: any) {
        console.error(`❌ Error sending ${file.name}:`, error);
        const errorMessage = error?.response?.data 
          ? JSON.stringify(error.response.data)
          : error?.message || 'Unknown error';
        errors.push({
          filename: file.name,
          error: errorMessage,
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

