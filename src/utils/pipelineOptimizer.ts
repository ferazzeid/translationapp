import { supabase } from "@/integrations/supabase/client";
import { performanceAnalytics } from "./performanceAnalytics";
import { AudioChunker } from "./audioChunker";
import { TTSStreaming } from "./ttsStreaming";

export interface ProcessingResult {
  success: boolean;
  originalText: string;
  translatedText?: string;
  audioData?: string | string[];
  error?: string;
}

export class PipelineOptimizer {
  private ttsStreaming = new TTSStreaming();

  async processAudioOptimized(
    audioData: string, 
    speaker: "A" | "B", 
    originalLang: string, 
    targetLang: string, 
    voiceToUse: string,
    featureFlags?: any,
    onStepChange?: (step: string) => void
  ): Promise<ProcessingResult> {
    try {
      const timing = performanceAnalytics.startTiming(speaker, originalLang, targetLang);
      
      onStepChange?.("transcribing");
      
      // Convert base64 to blob for processing
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/webm' });
      
      // Audio chunking if enabled
      if (featureFlags?.audioChunking) {
        return await this.processAudioWithChunking(audioBlob, speaker, originalLang, targetLang, voiceToUse, featureFlags, onStepChange);
      }
      
      // Speech-to-text
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', originalLang);

      const { data: sttData, error: sttError } = await supabase.functions.invoke('speech-to-text', {
        body: formData
      });

      timing.recordStage('stt');

      if (sttError) throw sttError;
      if (!sttData?.text) throw new Error('No transcription received');

      const originalText = sttData.text;
      console.log(`Transcription (${speaker}):`, originalText);

      onStepChange?.("translating");

      // Parallel processing if enabled
      if (featureFlags?.parallelMTTTS) {
        return await this.processWithParallelization(originalText, speaker, originalLang, targetLang, voiceToUse, featureFlags, onStepChange, timing);
      }

      // Sequential processing (fallback)
      return await this.processSequentially(originalText, speaker, originalLang, targetLang, voiceToUse, featureFlags, onStepChange, timing);

    } catch (error) {
      console.error('Pipeline processing error:', error);
      return {
        success: false,
        originalText: '',
        translatedText: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async processWithParallelization(
    originalText: string,
    speaker: "A" | "B",
    originalLang: string,
    targetLang: string,
    voiceToUse: string,
    featureFlags: any,
    onStepChange?: (step: string) => void,
    timing?: any
  ): Promise<ProcessingResult> {
    // Start translation and TTS preparation in parallel
    const [translationResult] = await Promise.all([
      // Translation
      (async () => {
        const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-text', {
          body: {
            text: originalText,
            sourceLang: originalLang,
            targetLang: targetLang
          }
        });
        
        if (translateError) throw translateError;
        return translateData;
      })(),
      
      // TTS preparation (no-op for now, could pre-load voice models)
      Promise.resolve()
    ]);

    timing?.recordStage('translate');
    
    if (!translationResult?.translatedText) {
      throw new Error('Translation failed');
    }

    const translatedText = translationResult.translatedText;
    console.log(`Translation (${speaker}):`, translatedText);

    onStepChange?.("generating");

    // TTS with streaming if enabled
    if (featureFlags?.ttsStreaming) {
      return await this.processWithStreaming(originalText, translatedText, voiceToUse, timing);
    }

    // Regular TTS
    const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
      body: {
        text: translatedText,
        voice: voiceToUse
      }
    });

    timing?.recordStage('tts');

    if (ttsError) throw ttsError;
    if (!ttsData?.audioContent) throw new Error('No audio generated');

    timing?.recordStage('total');
    if (featureFlags?.timingAnalytics) {
      performanceAnalytics.logTiming(timing);
    }

    return {
      success: true,
      originalText,
      translatedText,
      audioData: ttsData.audioContent
    };
  }

  private async processSequentially(
    originalText: string,
    speaker: "A" | "B",
    originalLang: string,
    targetLang: string,
    voiceToUse: string,
    featureFlags: any,
    onStepChange?: (step: string) => void,
    timing?: any
  ): Promise<ProcessingResult> {
    // Translation
    const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-text', {
      body: {
        text: originalText,
        sourceLang: originalLang,
        targetLang: targetLang
      }
    });

    timing?.recordStage('translate');
    
    if (translateError) throw translateError;
    if (!translateData?.translatedText) throw new Error('Translation failed');

    const translatedText = translateData.translatedText;
    console.log(`Translation (${speaker}):`, translatedText);

    onStepChange?.("generating");

    // TTS
    const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
      body: {
        text: translatedText,
        voice: voiceToUse
      }
    });

    timing?.recordStage('tts');

    if (ttsError) throw ttsError;
    if (!ttsData?.audioContent) throw new Error('No audio generated');

    timing?.recordStage('total');
    if (featureFlags?.timingAnalytics) {
      performanceAnalytics.logTiming(timing);
    }

    return {
      success: true,
      originalText,
      translatedText,
      audioData: ttsData.audioContent
    };
  }

  private async processWithStreaming(
    originalText: string,
    translatedText: string,
    voiceToUse: string,
    timing?: any
  ): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      let audioStarted = false;
      
      this.ttsStreaming.synthesizeAndStream({
        text: translatedText,
        voice: voiceToUse,
        onFirstChunk: () => {
          audioStarted = true;
          timing?.recordStage('tts_first_chunk');
        },
        onProgress: (progress) => {
          if (progress === 1) {
            timing?.recordStage('tts');
            timing?.recordStage('total');
            resolve({
              success: true,
              originalText,
              translatedText,
              audioData: 'streaming' // Special marker for streaming audio
            });
          }
        },
        onError: (error) => {
          reject(error);
        }
      });
      
      // Fallback timeout
      setTimeout(() => {
        if (!audioStarted) {
          reject(new Error('TTS streaming timeout'));
        }
      }, 10000);
    });
  }

  private async processAudioWithChunking(
    audioBlob: Blob,
    speaker: "A" | "B",
    originalLang: string,
    targetLang: string,
    voiceToUse: string,
    featureFlags: any,
    onStepChange?: (step: string) => void
  ): Promise<ProcessingResult> {
    const chunks = await AudioChunker.chunkAudio(audioBlob);
    console.log(`Audio chunked into ${chunks.length} pieces`);
    
    let fullOriginalText = '';
    let fullTranslatedText = '';
    const audioChunks: string[] = [];
    
    for (const chunk of chunks) {
      // Process each chunk sequentially for now
      // Could be parallelized in the future
      const formData = new FormData();
      formData.append('audio', chunk.blob);
      formData.append('language', originalLang);

      const { data: sttData, error: sttError } = await supabase.functions.invoke('speech-to-text', {
        body: formData
      });

      if (sttError) throw sttError;
      if (!sttData?.text) continue;

      const chunkText = sttData.text;
      fullOriginalText += (fullOriginalText ? ' ' : '') + chunkText;

      // Translate chunk
      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-text', {
        body: {
          text: chunkText,
          sourceLang: originalLang,
          targetLang: targetLang
        }
      });

      if (translateError) throw translateError;
      if (!translateData?.translatedText) continue;

      const translatedChunk = translateData.translatedText;
      fullTranslatedText += (fullTranslatedText ? ' ' : '') + translatedChunk;

      // Generate TTS for chunk
      const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: translatedChunk,
          voice: voiceToUse
        }
      });

      if (ttsError) throw ttsError;
      if (ttsData?.audioContent) {
        audioChunks.push(ttsData.audioContent);
      }
    }

    return {
      success: true,
      originalText: fullOriginalText,
      translatedText: fullTranslatedText,
      audioData: audioChunks // Array of audio chunks
    };
  }
}

export const pipelineOptimizer = new PipelineOptimizer();