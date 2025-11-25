import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configure which OpenAI model to use (default: gpt-4o)
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

export async function GET(request: NextRequest) {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.' 
        },
        { status: 500 }
      );
    }

    console.log('✅ OpenAI API key found');
    console.log('Testing OpenAI API connection...');

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Make a simple test call
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond with a simple confirmation message.',
        },
        {
          role: 'user',
          content: 'Say "OpenAI API is working correctly" if you can read this.',
        },
      ],
      max_completion_tokens: 50,
    });

    const message = response.choices[0]?.message?.content || 'No response';

    console.log('✅ OpenAI API responded successfully');
    console.log('Response:', message);

    return NextResponse.json({
      success: true,
      message: 'OpenAI API is working!',
      response: message,
      model: response.model,
      usage: response.usage,
    });
  } catch (error: any) {
    console.error('❌ OpenAI API test failed:', error);
    
    let errorMessage = 'Unknown error';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response) {
      errorMessage = `API Error: ${error.response.status} - ${error.response.statusText}`;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

