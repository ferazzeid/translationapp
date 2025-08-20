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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId, audioChunk, language = 'en-US' } = await req.json();

    // Get Google Cloud service account key from admin settings
    const { data: keyData, error: keyError } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'google_cloud_service_account_key')
      .maybeSingle();

    if (keyError) {
      console.error('Failed to get Google Cloud service account key:', keyError);
      throw new Error('Database error accessing service account key configuration');
    }

    if (!keyData?.setting_value) {
      console.error('Google Cloud service account key not configured');
      throw new Error('Google Cloud service account key not configured - please add it in admin settings');
    }

    // Parse the service account JSON
    let credentials;
    try {
      credentials = JSON.parse(keyData.setting_value);
    } catch (parseError) {
      console.error('Invalid service account key format:', parseError);
      throw new Error('Invalid service account key format - please check the JSON structure');
    }
    
    // Get access token from Google OAuth2
    const tokenResponse = await getAccessToken(credentials);
    if (!tokenResponse.access_token) {
      throw new Error('Failed to get Google Cloud access token');
    }
    const accessToken = tokenResponse.access_token;

    switch (action) {
      case 'test_connection':
        return await testConnection(accessToken);
      
      case 'batch_transcribe':
        return await batchTranscribe(accessToken, audioChunk, language);
      
      case 'start':
        return await startStreamingSession(accessToken, language, sessionId);
      
      case 'send_audio':
        return await sendAudioChunk(accessToken, sessionId, audioChunk);
      
      case 'stop':
        return await stopStreamingSession(accessToken, sessionId);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in google-stt-streaming function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        provider: 'google_streaming'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function testConnection(accessToken: string) {
  try {
    console.log('[Google STT] Testing connection to Google Cloud Speech API...');
    
    // Test basic API connectivity by making a simple request
    const response = await fetch('https://speech.googleapis.com/v1/operations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Cloud API test failed:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid service account key - authentication failed');
      }
      
      throw new Error(`Google Cloud API error: ${response.status}`);
    }

    console.log('[Google STT] Connection test successful');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Google Cloud Speech API connection successful',
        provider: 'google_streaming'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[Google STT] Connection test error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        provider: 'google_streaming'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function batchTranscribe(accessToken: string, audioData: string, language: string) {
  try {
    console.log('[Google STT] Starting batch transcription...');
    
    // Send batch transcription request to Google Cloud Speech API
    const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: language,
          enableAutomaticPunctuation: true,
          model: 'latest_long'
        },
        audio: {
          content: audioData
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Cloud batch transcription failed:', response.status, errorText);
      throw new Error(`Google Cloud API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[Google STT] Batch transcription result:', result);

    if (result.results && result.results.length > 0) {
      const transcript = result.results[0].alternatives[0].transcript;
      
      return new Response(
        JSON.stringify({
          success: true,
          text: transcript,
          provider: 'google_streaming'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        text: '',
        provider: 'google_streaming'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Google STT] Batch transcription error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        provider: 'google_streaming'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function getAccessToken(credentials: any) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  // Create JWT header and payload
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payloadEncoded = btoa(JSON.stringify(payload));
  
  try {
    // Clean and format the private key
    let privateKeyPem = credentials.private_key;
    
    // Remove extra whitespace and ensure proper formatting
    privateKeyPem = privateKeyPem.replace(/\\n/g, '\n');
    
    // Convert PEM to DER format
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = privateKeyPem
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');
    
    // Decode base64 to get binary DER data
    const binaryDer = atob(pemContents);
    const der = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
      der[i] = binaryDer.charCodeAt(i);
    }
    
    // Import private key and sign
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      der,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      new TextEncoder().encode(`${header}.${payloadEncoded}`)
    );

    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    const jwt = `${header}.${payloadEncoded}.${signatureBase64}`;

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    return await tokenResponse.json();
  } catch (error) {
    console.error('JWT creation/token exchange failed:', error);
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

async function startStreamingSession(accessToken: string, language: string, sessionId: string) {
  console.log(`[Google STT] Starting streaming session: ${sessionId}`)
  
  // Initialize Google Cloud Speech streaming session
  const config = {
    config: {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: language,
      enableAutomaticPunctuation: true,
      model: 'latest_long'
    },
    interimResults: true
  }

  return new Response(
    JSON.stringify({
      success: true,
      sessionId,
      provider: 'google_streaming',
      config
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendAudioChunk(accessToken: string, sessionId: string, audioChunk: string) {
  console.log(`[Google STT] Processing audio chunk for session: ${sessionId}`)
  
  // Send audio chunk to Google Cloud Speech streaming API
  const response = await fetch(`https://speech.googleapis.com/v1/speech:streamingrecognize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true
      },
      audio: {
        content: audioChunk
      }
    })
  })

  const result = await response.json()
  
  if (result.results && result.results.length > 0) {
    const transcript = result.results[0].alternatives[0].transcript
    const confidence = result.results[0].alternatives[0].confidence || 0.8
    const isPartial = !result.results[0].isFinal

    return new Response(
      JSON.stringify({
        success: true,
        text: transcript,
        confidence,
        isPartial,
        provider: 'google_streaming'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      text: '',
      isPartial: true,
      provider: 'google_streaming'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function stopStreamingSession(accessToken: string, sessionId: string) {
  console.log(`[Google STT] Stopping streaming session: ${sessionId}`)
  
  return new Response(
    JSON.stringify({
      success: true,
      text: '',
      isPartial: false,
      sessionId,
      provider: 'google_streaming'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}