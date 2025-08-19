import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { apiKey } = body;

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If no apiKey provided, check if one exists
    if (!apiKey) {
      try {
        const existingKey = Deno.env.get('OPENAI_API_KEY');
        if (existingKey) {
          // Test the existing key
          const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${existingKey}`,
              'Content-Type': 'application/json',
            },
          });
          
          return new Response(
            JSON.stringify({ 
              hasKey: true,
              isValid: response.ok
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              hasKey: false,
              isValid: false
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      } catch (error) {
        console.error('Error checking existing key:', error);
        return new Response(
          JSON.stringify({ 
            hasKey: false,
            isValid: false
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Test the API key by making a simple request to OpenAI
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Additional test: try to make a minimal completion request
      const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });

      const valid = testResponse.ok;
      
      if (valid) {
        // Save the key to Supabase secrets
        try {
          const { error: secretError } = await supabase
            .from('vault')
            .upsert({ 
              id: 'openai-api-key',
              secret: apiKey,
              name: 'OPENAI_API_KEY'
            });
          
          if (secretError) {
            console.error('Error saving to vault:', secretError);
          }
        } catch (error) {
          console.error('Error saving API key:', error);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          isValid: valid,
          hasKey: valid,
          message: valid ? 'API key is valid and saved' : 'API key test failed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.error('OpenAI API validation failed:', response.status, await response.text());
      return new Response(
        JSON.stringify({ 
          isValid: false,
          hasKey: false,
          message: 'Invalid API key or insufficient permissions' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error validating OpenAI API key:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to validate API key',
        isValid: false,
        hasKey: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});