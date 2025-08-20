import { supabase } from "@/integrations/supabase/client";
import { performanceAnalytics } from "./performanceAnalytics";
import { AudioChunker } from "./audioChunker";
import { TTSStreaming } from "./ttsStreaming";
import { validateBeforeEdgeFunction } from "./audioValidation";

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
      
      // CRITICAL ERROR PREVENTION: Use comprehensive validation system
      // This validation system prevents ALL known causes of edge function failures
      const validation = validateBeforeEdgeFunction(audioData, originalLang, targetLang, speaker);
      
      if (!validation.isValid) {
        throw new Error(validation.error || 'Audio validation failed');
      }
      
      console.log('🎯 Audio processing started:', {
        speaker,
        originalLang,
        targetLang,
        voice: voiceToUse,
        audioSizeBytes: validation.audioSizeBytes,
        estimatedDurationMs: validation.estimatedDurationMs,
        featureFlags: Object.keys(featureFlags || {}).filter(key => featureFlags[key])
      });
      
      // Audio chunking if enabled - convert to blob only for chunking
      if (featureFlags?.audioChunking) {
        console.log('📦 Using audio chunking pipeline');
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/webm' });
        return await this.processAudioWithChunking(audioBlob, speaker, originalLang, targetLang, voiceToUse, featureFlags, onStepChange);
      }
      
      console.log('🚀 Sending to speech-to-text edge function...');

      // CRITICAL: Send exactly what the edge function expects
      const { data: sttData, error: sttError } = await supabase.functions.invoke('speech-to-text', {
        body: {
          audio: audioData,
          language: originalLang
        }
      });

      timing.recordStage('stt');
      
      console.log('📥 Speech-to-text response received');

      // ENHANCED ERROR HANDLING: Provide specific error details and solutions
      if (sttError) {
        console.error('❌ SPEECH-TO-TEXT ERROR:', {
          error: sttError,
          message: sttError.message,
          context: sttError.context,
          audioSample: audioData.slice(0, 50) + '...',
          requestPayloadSize: JSON.stringify({audio: audioData, language: originalLang}).length
        });
        
        // Provide user-friendly error messages with actionable solutions
        let userError = 'Speech recognition failed';
        
        if (sttError.message?.includes('API key') || sttError.message?.includes('not configured')) {
          userError = 'Speech recognition service not configured - please contact administrator';
        } else if (sttError.message?.includes('too short')) {
          userError = 'Please speak longer - minimum 0.5 seconds required';
        } else if (sttError.message?.includes('too long')) {
          userError = 'Please speak shorter phrases - maximum 60 seconds allowed';
        } else if (sttError.message?.includes('non-2xx')) {
          userError = 'Speech recognition service temporarily unavailable - please try again';
        } else if (sttError.message?.includes('timeout')) {
          userError = 'Speech recognition timed out - please try shorter phrases';
        }
        
        throw new Error(userError);
      }
      
      if (!sttData?.text || sttData.text.trim().length === 0) {
        console.error('❌ No transcription received:', sttData);
        throw new Error('No speech detected - please speak clearly and try again');
      }

      const originalText = sttData.text.trim();
      console.log(`✅ Transcription successful: "${originalText}" (${originalText.length} chars)`);
      console.log(`📊 Speech-to-text completed in ${timing.stages.stt || 0}ms`);
      console.log(`Transcription (${speaker}):`, originalText);

      onStepChange?.("translating");

      // Parallel processing if enabled
      if (featureFlags?.parallelMTTTS) {
        return await this.processWithParallelization(originalText, speaker, originalLang, targetLang, voiceToUse, featureFlags, onStepChange, timing);
      }

      // Sequential processing (fallback)
      return await this.processSequentially(originalText, speaker, originalLang, targetLang, voiceToUse, featureFlags, onStepChange, timing);

    } catch (error) {
      console.error('=== PIPELINE PROCESSING ERROR ===');
      console.error('Error details:', error);
      console.error('Speaker:', speaker);
      console.error('Languages:', { originalLang, targetLang });
      console.error('Audio data length:', audioData?.length || 0);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('=== END ERROR LOG ===');
      
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
            fromLanguage: originalLang,
            toLanguage: targetLang
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
    // Translation - CRITICAL: Use correct parameter names as expected by translate-text function
    const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-text', {
      body: {
        text: originalText,
        fromLanguage: originalLang,
        toLanguage: targetLang
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
      
      // CRITICAL: Convert chunk blob to base64 for speech-to-text function
      // Same issue as main pipeline - function expects JSON with base64, not FormData
      const chunkBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          if (!result || !result.includes(',')) {
            reject(new Error('Invalid file reader result for chunk'));
            return;
          }
          const base64 = result.split(',')[1];
          if (!base64) {
            reject(new Error('Failed to extract base64 data from chunk'));
            return;
          }
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('FileReader error for chunk'));
        reader.readAsDataURL(chunk.blob);
      });

      // Validate chunk data
      if (!chunkBase64 || chunkBase64.length === 0) {
        console.warn('Empty chunk detected, skipping');
        continue;
      }

      console.log(`Processing chunk: ${chunkBase64.length} chars`);

      const { data: sttData, error: sttError } = await supabase.functions.invoke('speech-to-text', {
        body: {
          audio: chunkBase64,
          language: originalLang
        }
      });

      if (sttError) {
        console.error('Speech-to-text chunk error:', sttError);
        throw new Error(`Speech-to-text chunk failed: ${sttError.message || 'Unknown error'}`);
      }
      if (!sttData?.text) {
        console.log('No transcription for this chunk, skipping');
        continue;
      }

      const chunkText = sttData.text;
      fullOriginalText += (fullOriginalText ? ' ' : '') + chunkText;

      // Translate chunk - CRITICAL: Use correct parameter names
      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-text', {
        body: {
          text: chunkText,
          fromLanguage: originalLang,
          toLanguage: targetLang
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