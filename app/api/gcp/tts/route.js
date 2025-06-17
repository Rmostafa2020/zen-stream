// app/api/generate-audio/route.js

import { NextResponse } from 'next/server';
// 1. Import the correct client library
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// 2. Instantiate the client. 
// It will automatically find and use your service account credentials
if (!process.env.GCP_SERVICE_ACCOUNT_KEY) {
  throw new Error('The GCP_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
const ttsClient = new TextToSpeechClient({ credentials });

export async function POST(request) {
  try {
    const { text, voice = 'en-US-Wavenet-A' } = await request.json(); // Allow voice selection from client

    if (!text) {
      return NextResponse.json(
        { error: "Text input is required." },
        { status: 400 }
      );
    }
    
    // 3. Construct the TTS request
    const ttsRequest = {
      input: { text: text },
      // All available voices: https://cloud.google.com/text-to-speech/docs/voices
      voice: {
        languageCode: 'en-US',
        name: voice, // e.g., 'en-US-Studio-O' (premium), 'en-US-Wavenet-A' (standard)
      },
      // Select the type of audio encoding. MP3 is common for web.
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0, // Optional: Adjust speed
      },
    };

    // 4. Perform the text-to-speech request
    const [response] = await ttsClient.synthesizeSpeech(ttsRequest);
    
    // The response contains the audio data as a Buffer.
    const audioBuffer = response.audioContent;

    // 5. Return the audio buffer directly to the client
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg', // Use 'audio/mpeg' for MP3
        'Content-Disposition': 'attachment; filename="audio.mp3"',
      }
    });

  } catch (error) {
    console.error("Google Cloud TTS Error:", error);
    return NextResponse.json(
      { error: "Failed to generate audio.", details: error.message },
      { status: 500 }
    );
  }
}