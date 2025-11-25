import { NextRequest, NextResponse } from 'next/server';

// Note: This route is deprecated - we now use Zapier for document parsing
// This route is disabled to prevent build errors with canvas/pdfjs-dist in serverless environments

/* DISABLED CODE - All helper functions commented out to prevent build errors
// Configure which OpenAI model to use (default: gpt-4o)
// Options: 'gpt-4o', 'gpt-5.1', 'gpt-5-mini', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// Initialize OpenAI client (lazy initialization to check for key)
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables. Please add it to your .env.local file.');
  }
  return new OpenAI({
    apiKey: apiKey,
  });
}

// Helper to convert PDF pages to images
async function pdfToImages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const images: string[] = [];

  // Convert each page to an image (limit to first 10 pages for performance)
  const maxPages = Math.min(numPages, 10);
  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better quality
    
    // Create canvas
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    
    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context as any,
      viewport: viewport,
      canvas: canvas as any,
    };
    await page.render(renderContext).promise;
    
    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/png');
    images.push(imageData);
  }

  return images;
}


// Helper to read file content based on type
async function readFileContent(file: File): Promise<string> {
  const type = file.type;
  const name = file.name.toLowerCase();

  // For JSON files, parse directly
  if (type === 'application/json' || name.endsWith('.json')) {
    const text = await file.text();
    return text;
  }

  // For CSV files, return as text
  if (type === 'text/csv' || type === 'application/vnd.ms-excel' || name.endsWith('.csv')) {
    return await file.text();
  }

  // For PDF files, mark for conversion to images
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'PDF_FILE'; // Marker to indicate this needs PDF-to-image conversion
  }

  // For images, convert to base64
  if (type.startsWith('image/') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${type};base64,${base64}`;
    return `IMAGE_BASE64:${dataUrl}`;
  }

  // Default: try to read as text
  return await file.text();
}
*/

export async function POST(request: NextRequest) {
  // This route is deprecated - document parsing is now handled by Zapier
  return NextResponse.json(
    {
      success: false,
      error: 'This endpoint is deprecated. Document parsing is now handled by Zapier webhook integration.',
      message: 'Please use the Zapier webhook flow instead.',
    },
    { status: 410 } // 410 Gone - indicates the resource is no longer available
  );
  
  /* DISABLED CODE - Keeping for reference
  console.log('=== PARSE DOCUMENTS API CALLED ===');
  
  try {
    // Check for OpenAI API key
    console.log('Checking for OpenAI API key...');
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key missing from environment variables');
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY=sk-your-key-here to your .env.local file and restart the dev server.' 
        },
        { status: 500 }
      );
    }
    console.log('✅ OpenAI API key found');

    console.log('Reading form data...');
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    console.log(`Received ${files.length} file(s)`);

    if (!files || files.length === 0) {
      console.error('❌ No files provided');
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const allItems: any[] = [];
    const errors: string[] = [];

    console.log(`Processing ${files.length} file(s)...`);
    // Process each file
    for (const file of files) {
      console.log(`\n--- Processing file: ${file.name} ---`);
      try {
        let fileContent: string;

        // Read file content
        try {
          console.log(`Reading file content for ${file.name}...`);
          fileContent = await readFileContent(file);
          console.log(`✅ File content read, length: ${fileContent.length} characters`);
        } catch (readError) {
          console.error(`❌ Failed to read ${file.name}:`, readError);
          errors.push(`Failed to read ${file.name}: ${readError instanceof Error ? readError.message : 'Unknown error'}`);
          continue;
        }

        // For JSON files, parse directly
        if (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')) {
          try {
            const jsonData = JSON.parse(fileContent);
            const items = Array.isArray(jsonData) ? jsonData : [jsonData];
            allItems.push(...items.map((item: any) => ({
              ...item,
              file_id: file.name,
            })));
            console.log(`✅ Parsed ${items.length} items from JSON file`);
            continue;
          } catch (parseError) {
            // If JSON parsing fails, treat as text and send to OpenAI
            console.log('JSON parse failed, sending to OpenAI as text');
          }
        }

        // Check if this is a PDF or image that needs Vision API
        const isPDF = fileContent === 'PDF_FILE';
        const isImage = fileContent.startsWith('IMAGE_BASE64:');
        
        let openaiContent: any[] = [];
        
        if (isPDF) {
          // Convert PDF pages to images
          console.log(`Converting PDF ${file.name} to images...`);
          const pdfImages = await pdfToImages(file);
          console.log(`✅ Converted PDF to ${pdfImages.length} image(s)`);
          
          if (pdfImages.length === 0) {
            errors.push(`Failed to convert PDF ${file.name} to images`);
            continue;
          }
          
          // Build content array with text prompt and all PDF page images
          openaiContent = [
            {
              type: 'text',
              text: `You are currently being provided with images of a PDF document containing one or more orders for an event rental company. Your goal is to extract order information from these PDF pages. The order is for an event rental company that is supposed to provide furniture, decor, and other items to the event. You need to return the following information that you can find for each order. None of these orders have to do with one another. If there are multiple orders in the same PDF, you will need to return a JSON object with an "items" array containing objects with the same fields.

Return a JSON object with an "items" array. Each object in the array should have these fields:
- file_id: "${file.name}"
- order_name: name of the order/event (or "Unknown Order" if not found)
- event_date: date in YYYY-MM-DD format (or null)
- pickup_time: scheduled pickup time (or null)
- dropoff_time: scheduled dropoff time (or null)
- venue_name: name of the venue (or null)
- venue_address: full address (or null)
- item_name: name of the item/product (or null)
- quantity: number as integer (or 0)
- rack_count: number as integer (or null)

If multiple items exist, create multiple objects in the array.
If a field is not found, use null for strings/dates, 0 for quantity.

REQUIRED FORMAT: {"items": [{"file_id": "...", "order_name": "...", ...}]}`,
            },
            // Add all PDF page images
            ...pdfImages.map(img => ({
              type: 'image_url' as const,
              image_url: {
                url: img,
              },
            })),
          ];
        } else if (isImage) {
          // Extract base64 image
          const dataUrl = fileContent.replace('IMAGE_BASE64:', '');
          
          openaiContent = [
            {
              type: 'text',
              text: `You are currently being provided with an image containing one or more orders for an event rental company. Your goal is to extract order information from this image. The order is for an event rental company that is supposed to provide furniture, decor, and other items to the event. You need to return the following information that you can find for each order. None of these orders have to do with one another. If there are multiple orders in the same image, you will need to return a JSON object with an "items" array containing objects with the same fields.

Return a JSON object with an "items" array. Each object in the array should have these fields:
- file_id: "${file.name}"
- order_name: name of the order/event (or "Unknown Order" if not found)
- event_date: date in YYYY-MM-DD format (or null)
- pickup_time: scheduled pickup time (or null)
- dropoff_time: scheduled dropoff time (or null)
- venue_name: name of the venue (or null)
- venue_address: full address (or null)
- item_name: name of the item/product (or null)
- quantity: number as integer (or 0)
- rack_count: number as integer (or null)

If multiple items exist, create multiple objects in the array.
If a field is not found, use null for strings/dates, 0 for quantity.

REQUIRED FORMAT: {"items": [{"file_id": "...", "order_name": "...", ...}]}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ];
        } else {
          // Regular text content (CSV, etc.)
          const prompt = `You are a logistics document parser for an event rental company. Extract order information from the following document.

CRITICAL: You MUST return a JSON object with an "items" array, even if you can only extract partial information.

For each order item found, create an object in the "items" array with these fields:
- file_id: "${file.name}"
- order_name: name of the order/event (or "Unknown Order" if not found)
- event_date: date in YYYY-MM-DD format (or null)
- pickup_time: scheduled pickup time (or null)
- dropoff_time: scheduled dropoff time (or null)
- venue_name: name of the venue (or null)
- venue_address: full address (or null)
- item_name: name of the item/product (or null)
- quantity: number as integer (or 0)
- rack_count: number as integer (or null)

If multiple items exist, create multiple objects in the array.
If a field is not found, use null for strings/dates, 0 for quantity.

REQUIRED FORMAT: {"items": [{"file_id": "...", "order_name": "...", ...}]}

Document content:
${fileContent.substring(0, 15000)}`;

          openaiContent = [
            {
              role: 'user',
              content: prompt,
            },
          ];
        }

        console.log(`Calling OpenAI API for ${file.name}...`);
        const openai = getOpenAIClient();
        let response;
        try {
          console.log(`Sending request to OpenAI (model: ${OPENAI_MODEL})...`);
          
          if (isPDF || isImage) {
            // Use Vision API for PDFs and images
            response = await openai.chat.completions.create({
              model: OPENAI_MODEL,
              messages: [
                {
                  role: 'system',
                  content: 'You are a logistics document parser. Always return a JSON object with an "items" array containing order objects. Each object must have: file_id, order_name, event_date, pickup_time, dropoff_time, venue_name, venue_address, item_name, quantity, and optionally rack_count.',
                },
                {
                  role: 'user',
                  content: openaiContent,
                },
              ],
              response_format: { type: 'json_object' },
            });
          } else {
            // Regular text content
            response = await openai.chat.completions.create({
              model: OPENAI_MODEL,
              messages: [
                {
                  role: 'system',
                  content: 'You are a logistics document parser. Always return a JSON object with an "items" array containing order objects. Each object must have: file_id, order_name, event_date, pickup_time, dropoff_time, venue_name, venue_address, item_name, quantity, and optionally rack_count.',
                },
                {
                  role: 'user',
                  content: fileContent.substring(0, 15000),
                },
              ],
              response_format: { type: 'json_object' },
            });
          }
          
          console.log(`✅ OpenAI API responded successfully`);
        } catch (openaiError: any) {
          console.error(`❌ OpenAI API error for ${file.name}:`, openaiError);
          errors.push(`OpenAI API error for ${file.name}: ${openaiError.message || 'Unknown error'}`);
          continue;
        }

        const content = response.choices[0]?.message?.content || '{"items": []}';
        console.log(`OpenAI response for ${file.name}:`, content.substring(0, 500));
        
        try {
          const parsed = JSON.parse(content);
          console.log(`Parsed JSON for ${file.name}:`, JSON.stringify(parsed, null, 2));
          
          let items: any[] = [];
          
          if (Array.isArray(parsed)) {
            items = parsed;
          } else if (parsed.items && Array.isArray(parsed.items)) {
            items = parsed.items;
          } else if (parsed.orders && Array.isArray(parsed.orders)) {
            items = parsed.orders;
          } else if (typeof parsed === 'object' && parsed !== null) {
            items = [parsed];
          }
          
          console.log(`Extracted ${items.length} items from ${file.name}`);
          
          if (items.length > 0) {
            allItems.push(...items.map((item: any) => ({
              ...item,
              file_id: item.file_id || file.name,
            })));
          } else {
            errors.push(`No items found in OpenAI response for ${file.name}`);
            console.warn(`No items extracted from ${file.name}. Full response:`, content);
          }
        } catch (parseError) {
          errors.push(`Failed to parse OpenAI response for ${file.name}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
          console.error('Parse error:', parseError);
          console.error('Raw content:', content);
        }
      } catch (fileError) {
        errors.push(`Error processing ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
      }
    }

    console.log(`Total items parsed: ${allItems.length}`);
    console.log(`Errors: ${errors.length}`);
    
    return NextResponse.json({
      success: true,
      items: allItems,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Parse documents error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
  */
}

