import { AbstractSTTProvider, STTConfig, STTTranscriptionResult, STTStreamingSession, STTTelemetry } from '@/types/stt';
import { supabase } from '@/integrations/supabase/client';

export class GoogleStreamingSTTService extends AbstractSTTProvider {
  private activeSessions: Map<string, STTStreamingSession> = new Map();
  private sessionCounter = 0;

  constructor(config: STTConfig) {
    super(config);
  }

  getProviderName() {
    return 'google_streaming' as const;
  }

  isStreamingSupported(): boolean {
    return true;
  }

  // Batch transcription (fallback mode)
  async transcribe(audioData: string, language?: string): Promise<STTTranscriptionResult> {
    const startTime = Date.now();
    
    try {
      console.log('[Google STT] Starting batch transcription...', { 
        audioLength: audioData.length,
        language 
      });

      const { data, error } = await supabase.functions.invoke('google-stt-streaming', {
        body: { 
          action: 'batch_transcribe',
          audio: audioData,
          language: language || 'en-US'
        }
      });

      if (error) {
        throw new Error(`Google STT batch transcription error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Batch transcription failed');
      }

      const processingTime = Date.now() - startTime;
      
      // Log telemetry
      this.logTelemetry({
        provider: 'google_streaming',
        firstTokenLatency: processingTime,
        fullTranscriptTime: processingTime,
        audioLength: audioData.length,
        success: true
      });

      console.log('[Google STT] Batch transcription completed:', { 
        text: data.text,
        processingTime 
      });

      return {
        success: true,
        text: data.text,
        processingTime,
        provider: 'google_streaming'
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown transcription error';
      
      // Log telemetry for failed attempts
      this.logTelemetry({
        provider: 'google_streaming',
        firstTokenLatency: processingTime,
        fullTranscriptTime: processingTime,
        audioLength: audioData.length,
        success: false,
        error: errorMessage
      });

      console.error('[Google STT] Batch transcription failed:', errorMessage);

      return {
        success: false,
        text: '',
        processingTime,
        provider: 'google_streaming',
        error: errorMessage
      };
    }
  }

  async startStreaming(language = 'en-US'): Promise<STTStreamingSession> {
    const sessionId = `google_stt_${++this.sessionCounter}_${Date.now()}`;
    const session: STTStreamingSession = {
      sessionId,
      isActive: true,
      startTime: Date.now(),
      lastActivity: Date.now()
    };

    this.activeSessions.set(sessionId, session);

    console.log('[Google STT] Starting streaming session:', { sessionId, language });

    try {
      // Initialize Google Cloud Speech streaming session via edge function
      const { data, error } = await supabase.functions.invoke('google-stt-streaming', {
        body: {
          action: 'start',
          sessionId,
          language
        }
      });

      if (error) {
        throw new Error(`Failed to start Google STT session: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to start streaming session');
      }

      console.log('[Google STT] Session started successfully:', data);
    } catch (error) {
      console.error('[Google STT] Failed to start session:', error);
      session.isActive = false;
      this.activeSessions.delete(sessionId);
      throw error;
    }
    
    return session;
  }

  async sendAudioChunk(sessionId: string, audioChunk: ArrayBuffer): Promise<STTTranscriptionResult> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return {
        success: false,
        text: '',
        provider: 'google_streaming',
        error: 'Invalid or inactive session'
      };
    }

    // Update last activity
    session.lastActivity = Date.now();

    console.log('[Google STT] Processing audio chunk:', { 
      sessionId, 
      chunkSize: audioChunk.byteLength 
    });

    try {
      // Convert ArrayBuffer to base64
      const uint8Array = new Uint8Array(audioChunk);
      const base64Audio = btoa(String.fromCharCode(...uint8Array));

      // Send audio chunk to Google Cloud Speech streaming API via edge function
      const { data, error } = await supabase.functions.invoke('google-stt-streaming', {
        body: {
          action: 'send_audio',
          sessionId,
          audioChunk: base64Audio
        }
      });

      if (error) {
        throw new Error(`Failed to process audio chunk: ${error.message}`);
      }

      if (!data.success) {
        return {
          success: false,
          text: '',
          provider: 'google_streaming',
          error: data.error || 'Failed to process audio chunk'
        };
      }

      return {
        success: true,
        text: data.text || '',
        isPartial: data.isPartial || true,
        confidence: data.confidence || 0.8,
        provider: 'google_streaming'
      };
    } catch (error) {
      console.error('[Google STT] Error processing audio chunk:', error);
      return {
        success: false,
        text: '',
        provider: 'google_streaming',
        error: error.message
      };
    }
  }

  async stopStreaming(sessionId: string): Promise<STTTranscriptionResult> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return {
        success: false,
        text: '',
        provider: 'google_streaming',
        error: 'Session not found'
      };
    }

    // Mark session as inactive
    session.isActive = false;
    
    const processingTime = Date.now() - session.startTime;

    console.log('[Google STT] Stopping streaming session:', { sessionId, processingTime });

    try {
      // Finalize Google Cloud Speech streaming session and get final transcript
      const { data, error } = await supabase.functions.invoke('google-stt-streaming', {
        body: {
          action: 'stop',
          sessionId
        }
      });

      if (error) {
        console.error('[Google STT] Error stopping session:', error);
      }

      const finalText = data?.text || '';

      // Log telemetry
      this.logTelemetry({
        provider: 'google_streaming',
        firstTokenLatency: 500, // Mock: first partial result time
        fullTranscriptTime: processingTime,
        audioLength: processingTime, // Approximate based on duration
        success: true
      });

      // Clean up session
      this.activeSessions.delete(sessionId);

      return {
        success: true,
        text: finalText,
        isPartial: false,
        confidence: 0.95,
        processingTime,
        provider: 'google_streaming'
      };
    } catch (error) {
      console.error('[Google STT] Error stopping session:', error);
      
      // Clean up session even on error
      this.activeSessions.delete(sessionId);
      
      return {
        success: false,
        text: '',
        provider: 'google_streaming',
        error: error.message,
        processingTime
      };
    }
  }

  // Cleanup inactive sessions
  cleanupInactiveSessions(): void {
    const now = Date.now();
    const timeoutMs = this.config.timeout;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity > timeoutMs) {
        console.log('[Google STT] Cleaning up inactive session:', sessionId);
        session.isActive = false;
        this.activeSessions.delete(sessionId);
      }
    }
  }
}