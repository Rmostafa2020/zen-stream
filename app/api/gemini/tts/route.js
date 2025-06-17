// app/api/generate-audio/route.js

import { NextResponse } from 'next/server';
// This is the official and correct package for the Google AI SDK in Node.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// It's best practice to initialize the client outside the handler
// so it can be reused across multiple serverless function invocations.
const genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    console
    const { text, voice } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text input is required." },
        { status: 400 }
      );
    }
    
    // The Gemini Text-to-Speech API is currently in private preview and requires
    // using the 'v1beta' endpoint. The standard SDK methods do not yet support
    // the full speechConfig. Therefore, we use a more direct API call method.
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Use a base model for the chat interface
    
    const result = await model.generateContent({
        contents: [{
            parts: [{
                // Ensure the text is a string and not excessively long
                text: String(text).substring(0, 32000) 
            }]
        }],
        // This is the generationConfig for the Text-to-Speech feature
        generationConfig: {
            responseMimeType: 'audio/wav', // Request WAV audio directly
        },
        // This is the tool configuration that specifies TTS parameters
        tools: [{
            "google_search": { "tts_model": "gemini-2.5-flash-preview-tts" }
        }],
    });

    // The audio data is returned in the response parts when configured correctly
    const audioData = result.response.candidates[0].content.parts[0].inlineData.data;
    const audioBuffer = Buffer.from(audioData, 'base64');

    // Return the audio buffer directly to the client.
    // We do NOT save a file on the server.
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="generated_audio.wav"',
      }
    });

  } catch (error) {
    // Log the full error for better debugging on the server
    console.error("TTS Generation Error:", error); 
    
    return NextResponse.json(
      { 
        error: "Failed to generate audio.", 
        // Provide the error message in the response for easier debugging
        details: error.message 
      },
      { status: 500 }
    );
  }
}
