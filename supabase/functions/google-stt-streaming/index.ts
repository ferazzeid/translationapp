import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, sessionId, audioChunk, language = 'en-US' } = await req.json()

    // Get Google Cloud service account key from environment
    const serviceAccountKey = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY')
    if (!serviceAccountKey) {
      throw new Error('Google Cloud service account key not configured')
    }

    // Parse the service account JSON
    const credentials = JSON.parse(serviceAccountKey)
    
    // Get access token from Google OAuth2
    const tokenResponse = await getAccessToken(credentials)
    const accessToken = tokenResponse.access_token

    switch (action) {
      case 'start':
        return await startStreamingSession(accessToken, language, sessionId)
      
      case 'send_audio':
        return await sendAudioChunk(accessToken, sessionId, audioChunk)
      
      case 'stop':
        return await stopStreamingSession(accessToken, sessionId)
      
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error in google-stt-streaming function:', error)
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
    )
  }
})

async function getAccessToken(credentials: any) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }

  // Create JWT header and payload
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payloadEncoded = btoa(JSON.stringify(payload))
  
  // Import private key and sign
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(credentials.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(`${header}.${payloadEncoded}`)
  )

  const jwt = `${header}.${payloadEncoded}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })

  return await tokenResponse.json()
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