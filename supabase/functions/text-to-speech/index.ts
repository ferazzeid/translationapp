import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to safely convert ArrayBuffer to base64 in chunks
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 32768 // 32KB chunks to prevent memory issues
  let result = ''
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize)
    result += String.fromCharCode(...chunk)
  }
  
  return btoa(result)
}

// Helper function to split text into chunks for long text
function splitTextIntoChunks(text: string, maxLength: number = 4000): string[] {
  if (text.length <= maxLength) {
    return [text]
  }
  
  const chunks: string[] = []
  let currentChunk = ''
  const sentences = text.split(/[.!?]+/)
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += sentence + (sentence.match(/[.!?]$/) ? '' : '.')
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice = 'alloy', language, testProvider } = await req.json()
    console.log('TTS request:', { text: text?.substring(0, 100), voice, language, textLength: text?.length, testProvider })

    if (!text) {
      throw new Error('Text is required')
    }

    // Import Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the active TTS provider (or use testProvider for testing)
    let activeProvider = 'openai' // default
    if (testProvider) {
      activeProvider = testProvider
    } else {
      const { data: providerData } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'tts_provider')
        .single()
      
      if (providerData?.setting_value) {
        activeProvider = providerData.setting_value
      }
    }

    console.log('Using TTS provider:', activeProvider)

    // Route to the appropriate provider
    if (activeProvider === 'google') {
      return await handleGoogleTTS(text, voice, language, supabase)
    } else if (activeProvider === 'elevenlabs') {
      return await handleElevenLabsTTS(text, voice, language, supabase)
    } else {
      return await handleOpenAITTS(text, voice, language)
    }

  } catch (error) {
    console.error('TTS error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

// OpenAI TTS Handler
async function handleOpenAITTS(text: string, voice: string, language?: string) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  // Check if text is too long and needs chunking
  const maxTTSLength = 4000 // OpenAI TTS limit
  
  if (text.length > maxTTSLength) {
    console.log('Text too long, splitting into chunks')
    const chunks = splitTextIntoChunks(text, maxTTSLength)
    console.log(`Split text into ${chunks.length} chunks`)
    
    const audioChunks: string[] = []
    
    // Process each chunk sequentially
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`Processing chunk ${i + 1}/${chunks.length}, length: ${chunk.length}`)
      
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: chunk,
          voice: voice,
          response_format: 'mp3',
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API error:', response.status, errorText)
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const base64Audio = arrayBufferToBase64(arrayBuffer)
      audioChunks.push(base64Audio)
    }

    console.log('TTS success (chunked), total chunks:', audioChunks.length)

    return new Response(
      JSON.stringify({ 
        audioChunks: audioChunks,
        totalChunks: audioChunks.length,
        audioContent: audioChunks[0], // For backwards compatibility
        audioData: audioChunks[0] // For backwards compatibility
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } else {
    // Generate speech from text using OpenAI for normal-length text
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`)
    }

    // Convert audio buffer to base64 safely
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = arrayBufferToBase64(arrayBuffer)

    console.log('TTS success, audio length:', base64Audio.length)

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        audioData: base64Audio
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}

// Google Cloud TTS Handler
async function handleGoogleTTS(text: string, voice: string, language: string = 'en', supabase: any) {
  // Get Google Cloud API key
  const { data: keyData } = await supabase
    .from('admin_settings')
    .select('setting_value')
    .eq('setting_key', 'google_cloud_api_key')
    .single()

  if (!keyData?.setting_value) {
    throw new Error('Google Cloud API key not configured')
  }

  const googleApiKey = keyData.setting_value

  // Google Cloud TTS supports up to 5000 characters
  const maxTTSLength = 5000
  
  if (text.length > maxTTSLength) {
    const chunks = splitTextIntoChunks(text, maxTTSLength)
    const audioChunks: string[] = []
    
    for (const chunk of chunks) {
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: chunk },
          voice: { 
            languageCode: language,
            name: `${language}-Standard-A`
          },
          audioConfig: { audioEncoding: 'MP3' }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Google Cloud TTS error:', response.status, errorText)
        throw new Error(`Google Cloud TTS error: ${response.status}`)
      }

      const data = await response.json()
      audioChunks.push(data.audioContent)
    }

    return new Response(
      JSON.stringify({ 
        audioChunks: audioChunks,
        totalChunks: audioChunks.length,
        audioContent: audioChunks[0],
        audioData: audioChunks[0]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } else {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text: text },
        voice: { 
          languageCode: language,
          name: `${language}-Standard-A`
        },
        audioConfig: { audioEncoding: 'MP3' }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Cloud TTS error:', response.status, errorText)
      throw new Error(`Google Cloud TTS error: ${response.status}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({ 
        audioContent: data.audioContent,
        audioData: data.audioContent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}

// ElevenLabs TTS Handler
async function handleElevenLabsTTS(text: string, voice: string, language: string = 'en', supabase: any) {
  // Get ElevenLabs API key
  const { data: keyData } = await supabase
    .from('admin_settings')
    .select('setting_value')
    .eq('setting_key', 'elevenlabs_api_key')
    .single()

  if (!keyData?.setting_value) {
    throw new Error('ElevenLabs API key not configured')
  }

  const elevenLabsApiKey = keyData.setting_value

  // Map OpenAI voices to ElevenLabs voice IDs (using default high-quality voices)
  const voiceMap: { [key: string]: string } = {
    'alloy': '9BWtsMINqrJLrRacOk9x', // Aria
    'echo': 'CwhRBWXzGAHq8TQ4Fs17', // Roger  
    'fable': 'EXAVITQu4vr4xnSDxMaL', // Sarah
    'onyx': 'IKne3meq5aSn9XLyUdCD', // Charlie
    'nova': 'JBFqnCBsd6RMkjVDRZzb', // George
    'shimmer': 'XB0fDUnXU5powFXDhCwa', // Charlotte
    'default': '9BWtsMINqrJLrRacOk9x' // Aria
  }

  const voiceId = voiceMap[voice] || voiceMap['default']

  // ElevenLabs supports longer texts, but let's chunk at 10000 chars for safety
  const maxTTSLength = 10000
  
  if (text.length > maxTTSLength) {
    const chunks = splitTextIntoChunks(text, maxTTSLength)
    const audioChunks: string[] = []
    
    for (const chunk of chunks) {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey
        },
        body: JSON.stringify({
          text: chunk,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs TTS error:', response.status, errorText)
        throw new Error(`ElevenLabs TTS error: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const base64Audio = arrayBufferToBase64(arrayBuffer)
      audioChunks.push(base64Audio)
    }

    return new Response(
      JSON.stringify({ 
        audioChunks: audioChunks,
        totalChunks: audioChunks.length,
        audioContent: audioChunks[0],
        audioData: audioChunks[0]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } else {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs TTS error:', response.status, errorText)
      throw new Error(`ElevenLabs TTS error: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = arrayBufferToBase64(arrayBuffer)

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        audioData: base64Audio
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}