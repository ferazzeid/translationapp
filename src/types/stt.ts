// STT Provider Configuration Types
export type STTProvider = 'openai' | 'google_streaming';

export interface STTConfig {
  provider: STTProvider;
  fallbackProvider?: STTProvider;
  timeout: number;
  enableTelemetry: boolean;
}

export interface STTTranscriptionResult {
  success: boolean;
  text: string;
  confidence?: number;
  isPartial?: boolean;
  processingTime?: number;
  provider: STTProvider;
  error?: string;
}

export interface STTStreamingSession {
  sessionId: string;
  isActive: boolean;
  startTime: number;
  lastActivity: number;
}

export interface STTTelemetry {
  provider: STTProvider;
  firstTokenLatency: number;
  fullTranscriptTime: number;
  audioLength: number;
  success: boolean;
  error?: string;
}

// Abstract STT Provider Interface
export abstract class AbstractSTTProvider {
  protected config: STTConfig;

  constructor(config: STTConfig) {
    this.config = config;
  }

  // Batch transcription (current OpenAI flow)
  abstract transcribe(audioData: string, language?: string): Promise<STTTranscriptionResult>;

  // Streaming transcription (Google STT flow)
  abstract startStreaming(language?: string): Promise<STTStreamingSession>;
  abstract sendAudioChunk(sessionId: string, audioChunk: ArrayBuffer): Promise<STTTranscriptionResult>;
  abstract stopStreaming(sessionId: string): Promise<STTTranscriptionResult>;

  // Provider info
  abstract getProviderName(): STTProvider;
  abstract isStreamingSupported(): boolean;

  // Telemetry
  protected logTelemetry(telemetry: STTTelemetry): void {
    if (this.config.enableTelemetry) {
      console.log('[STT Telemetry]', telemetry);
      // TODO: Send to analytics service
    }
  }
}