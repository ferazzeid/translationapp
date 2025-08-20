import { AbstractSTTProvider, STTConfig, STTTranscriptionResult, STTStreamingSession, STTTelemetry } from '@/types/stt';
import { supabase } from '@/integrations/supabase/client';

export class OpenAISTTService extends AbstractSTTProvider {
  constructor(config: STTConfig) {
    super(config);
  }

  getProviderName() {
    return 'openai' as const;
  }

  isStreamingSupported(): boolean {
    return false; // OpenAI Whisper is batch-only
  }

  async transcribe(audioData: string, language?: string): Promise<STTTranscriptionResult> {
    const startTime = Date.now();
    
    try {
      console.log('[OpenAI STT] Starting transcription...', { 
        audioLength: audioData.length,
        language 
      });

      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { 
          audio: audioData,
          language: language || 'auto'
        }
      });

      if (error) {
        throw new Error(`Speech-to-text error: ${error.message}`);
      }

      if (!data?.text) {
        throw new Error('No transcription text received');
      }

      const processingTime = Date.now() - startTime;
      
      // Log telemetry
      this.logTelemetry({
        provider: 'openai',
        firstTokenLatency: processingTime, // For batch, this is total time
        fullTranscriptTime: processingTime,
        audioLength: audioData.length,
        success: true
      });

      console.log('[OpenAI STT] Transcription completed:', { 
        text: data.text,
        processingTime 
      });

      return {
        success: true,
        text: data.text,
        processingTime,
        provider: 'openai'
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown transcription error';
      
      // Log telemetry for failed attempts
      this.logTelemetry({
        provider: 'openai',
        firstTokenLatency: processingTime,
        fullTranscriptTime: processingTime,
        audioLength: audioData.length,
        success: false,
        error: errorMessage
      });

      console.error('[OpenAI STT] Transcription failed:', errorMessage);

      return {
        success: false,
        text: '',
        processingTime,
        provider: 'openai',
        error: errorMessage
      };
    }
  }

  // Streaming methods (not supported by OpenAI Whisper)
  async startStreaming(): Promise<STTStreamingSession> {
    throw new Error('Streaming not supported by OpenAI Whisper. Use batch transcription instead.');
  }

  async sendAudioChunk(): Promise<STTTranscriptionResult> {
    throw new Error('Streaming not supported by OpenAI Whisper. Use batch transcription instead.');
  }

  async stopStreaming(): Promise<STTTranscriptionResult> {
    throw new Error('Streaming not supported by OpenAI Whisper. Use batch transcription instead.');
  }
}