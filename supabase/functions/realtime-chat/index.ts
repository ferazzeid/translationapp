import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Upgrade the request to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let openaiWs: WebSocket | null = null;
    let sessionConfigured = false;

    socket.onopen = () => {
      console.log('Client WebSocket connected');
      
      // Connect to OpenAI Realtime API
      const openaiUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
      openaiWs = new WebSocket(openaiUrl, ['realtime', `openai-insecure-api-key.${openaiApiKey}`]);
      
      openaiWs.onopen = () => {
        console.log('Connected to OpenAI Realtime API');
      };
      
      openaiWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received from OpenAI:', data.type);
        
        // Configure session after receiving session.created
        if (data.type === 'session.created' && !sessionConfigured) {
          console.log('Configuring session...');
          const sessionUpdate = {
            event_id: `event_${Date.now()}`,
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: 'You are a helpful translation assistant. When the user speaks in one language, translate it to the other language and respond in that language. Be natural and conversational.',
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: 'inf'
            }
          };
          
          openaiWs?.send(JSON.stringify(sessionUpdate));
          sessionConfigured = true;
        }
        
        // Forward all messages to client
        socket.send(event.data);
      };
      
      openaiWs.onerror = (error) => {
        console.error('OpenAI WebSocket error:', error);
        socket.send(JSON.stringify({
          type: 'error',
          error: 'OpenAI connection error'
        }));
      };
      
      openaiWs.onclose = (event) => {
        console.log('OpenAI WebSocket closed:', event.code, event.reason);
        socket.close(1000, 'OpenAI connection closed');
      };
    };

    socket.onmessage = (event) => {
      console.log('Received from client:', typeof event.data);
      // Forward client messages to OpenAI
      if (openaiWs?.readyState === WebSocket.OPEN) {
        openaiWs.send(event.data);
      }
    };

    socket.onclose = () => {
      console.log('Client WebSocket disconnected');
      openaiWs?.close();
    };

    socket.onerror = (error) => {
      console.error('Client WebSocket error:', error);
      openaiWs?.close();
    };

    return response;

  } catch (error) {
    console.error('Error in realtime-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});