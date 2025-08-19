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

// Convert base64 to Uint8Array
function base64ToUint8Array(base64String: string): Uint8Array {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64String.replace(/^data:[^;]+;base64,/, '');
    
    // Decode base64 string
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  } catch (error) {
    console.error('Error processing base64:', error);
    throw new Error('Invalid base64 audio data');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, language } = await req.json();
    
    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get OpenAI API key from admin settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('admin_settings')
      .select('setting_key, setting_value')
      .eq('setting_key', 'openai_api_key')
      .single();

    if (settingsError || !settingsData?.setting_value) {
      console.error('OpenAI API key not configured in admin settings');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured in admin settings' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openaiApiKey = settingsData.setting_value;

    // Convert base64 audio to binary
    console.log(`Received audio data: ${audio.length} characters`);
    const binaryAudio = base64ToUint8Array(audio);
    
    // Validate audio size (minimum 500 bytes for webm header)
    if (binaryAudio.length < 500) {
      console.log(`Audio data too small: ${binaryAudio.length} bytes`);
      return new Response(
        JSON.stringify({ error: 'Audio recording too short, please speak longer' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing audio: ${binaryAudio.length} bytes`);

    // Create FormData for Whisper API
    const formData = new FormData();
    
    // Convert webm to wav for better OpenAI compatibility
    // Since webm conversion is complex, we'll use a simpler approach:
    // Send as wav format with proper headers to maximize compatibility
    const fileName = 'audio.wav';
    const mimeType = 'audio/wav';
    
    console.log(`Using format: ${fileName} (${mimeType})`);
    
    // Create blob with wav mime type for better OpenAI compatibility
    const audioBlob = new Blob([binaryAudio], { type: mimeType });
    formData.append('file', audioBlob, fileName);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');
    
    // Add language parameter if specified
    if (language && language !== 'auto-detect') {
      formData.append('language', language);
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