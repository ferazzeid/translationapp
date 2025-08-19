import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map language names to ISO-639-1 codes for OpenAI Whisper API
function getLanguageCode(language: string): string {
  const languageMap: { [key: string]: string } = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'portuguese': 'pt',
    'russian': 'ru',
    'japanese': 'ja',
    'korean': 'ko',
    'chinese': 'zh',
    'arabic': 'ar',
    'hindi': 'hi',
    'turkish': 'tr',
    'polish': 'pl',
    'dutch': 'nl',
    'swedish': 'sv',
    'danish': 'da',
    'norwegian': 'no',
    'finnish': 'fi',
    'hungarian': 'hu',
    'czech': 'cs',
    'slovak': 'sk',
    'slovenian': 'sl',
    'croatian': 'hr',
    'serbian': 'sr',
    'bulgarian': 'bg',
    'romanian': 'ro',
    'ukrainian': 'uk',
    'greek': 'el',
    'hebrew': 'he',
    'thai': 'th',
    'vietnamese': 'vi',
    'indonesian': 'id',
    'malay': 'ms',
    'tagalog': 'tl'
  };
  
  // Convert to lowercase for matching
  const lowerLang = language.toLowerCase();
  
  // Return mapped code or assume it's already in correct format
  return languageMap[lowerLang] || language;
}

// PROTECTED AUDIO PROCESSING FUNCTION - DO NOT MODIFY UNLESS CRITICAL BUG
// This function handles base64 to binary conversion with chunking for large audio files
// It's been optimized to handle WebM audio from browsers reliably
function base64ToUint8Array(base64String: string): Uint8Array {
  try {
    // Remove any whitespace and data URL prefix if present
    const cleanBase64 = base64String.replace(/\s/g, '').replace(/^data:audio\/[^;]+;base64,/, '');
    
    // For large audio files, process in chunks to prevent memory issues
    const chunkSize = 32768; // 32KB chunks
    const chunks: Uint8Array[] = [];
    
    for (let i = 0; i < cleanBase64.length; i += chunkSize) {
      const chunk = cleanBase64.slice(i, i + chunkSize);
      const binaryString = atob(chunk);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let j = 0; j < binaryString.length; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
      chunks.push(bytes);
    }
    
    // Combine all chunks into a single array
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result;
  } catch (error) {
    console.error('Error converting base64 to Uint8Array:', error);
    throw new Error('Invalid audio data format');
  }
}

// PROTECTED FUNCTION - DO NOT MODIFY
// Handles all audio format detection and creates proper blobs for OpenAI Whisper
function createAudioBlob(binaryAudio: Uint8Array): { blob: Blob; fileName: string; mimeType: string } {
  // Browser audio recording is typically WebM, so default to that
  // This is the most reliable approach for browser-recorded audio
  const fileName = 'audio.webm';
  const mimeType = 'audio/webm';
  
  console.log(`Creating audio blob: ${fileName} (${mimeType}) - Size: ${binaryAudio.length} bytes`);
  
  return {
    blob: new Blob([binaryAudio], { type: mimeType }),
    fileName,
    mimeType
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audio, language } = await req.json()
    
    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get OpenAI API key from admin settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'openai_api_key')
      .single();

    if (settingsError || !settingsData?.setting_value) {
      console.error('Failed to get OpenAI API key:', settingsError);
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openaiApiKey = settingsData.setting_value;

    // Convert base64 audio to binary using protected function
    console.log(`Received audio data: ${audio.length} characters`);
    const binaryAudio = base64ToUint8Array(audio);
    
    // Validate audio size with reasonable limits
    if (binaryAudio.length < 100) {
      console.log(`Audio data too small: ${binaryAudio.length} bytes`);
      return new Response(
        JSON.stringify({ error: 'Audio recording too short, please speak longer' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (binaryAudio.length > 25 * 1024 * 1024) {
      console.log(`Audio data too large: ${binaryAudio.length} bytes`);
      return new Response(
        JSON.stringify({ error: 'Audio recording too long, please speak shorter phrases' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing audio: ${binaryAudio.length} bytes`);

    // Create audio blob using protected function
    const { blob: audioBlob, fileName, mimeType } = createAudioBlob(binaryAudio);
    
    // Create FormData for Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, fileName);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');
    
    // Add language parameter if specified, convert to proper ISO code
    if (language && language !== 'auto-detect') {
      const languageCode = getLanguageCode(language);
      console.log(`Language conversion: ${language} -> ${languageCode}`);
      formData.append('language', languageCode);
    }

    console.log('Sending to OpenAI Whisper API...');

    // Send to OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI Whisper API error: ${response.status} ${errorText}`);
      
      // Try to parse the error to provide better feedback
      let errorMessage = 'Speech recognition service temporarily unavailable';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          if (errorData.error.message.includes('Invalid file format')) {
            errorMessage = 'Audio format not supported. Please try recording again.';
          } else if (errorData.error.message.includes('file size')) {
            errorMessage = 'Audio file too large or too small. Please try again.';
          } else {
            errorMessage = `Speech recognition failed: ${errorData.error.message}`;
          }
        }
      } catch (parseError) {
        // Use default error message
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: response.status >= 500 ? 500 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await response.json();
    console.log('Whisper transcription result:', result);

    // Extract text from Whisper response and clean it
    let transcribedText = result.text || '';
    
    // Remove any unwanted contamination text
    transcribedText = transcribedText
      .replace(/transcribed by https:\/\/otter\.ai/gi, '')
      .replace(/transcribed by otter\.ai/gi, '')
      .replace(/átirata: https:\/\/otter\.ai/gi, '')
      .replace(/átirata:/gi, '')
      .trim();
    
    console.log('Cleaned transcribed text:', transcribedText);

    return new Response(
      JSON.stringify({ 
        text: transcribedText,
        language: language
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in speech-to-text function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Speech recognition failed',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});