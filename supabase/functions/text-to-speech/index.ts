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
    const { text, voice = 'alloy', language } = await req.json()
    console.log('TTS request:', { text: text?.substring(0, 100), voice, language, textLength: text?.length })

    if (!text) {
      throw new Error('Text is required')
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Check if text is too long and needs chunking
    const maxTTSLength = 4000 // OpenAI TTS limit
    
    if (text.length > maxTTSLength) {
      console.log('Text too long, processing first chunk only for now')
      const truncatedText = text.substring(0, maxTTSLength) + '...'
      
      // Generate speech for truncated text
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: truncatedText,
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

      console.log('TTS success (truncated), audio length:', base64Audio.length)

      return new Response(
        JSON.stringify({ 
          audioContent: base64Audio,
          audioData: base64Audio,
          warning: 'Text was truncated due to length limit'
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