import { supabase } from "@/integrations/supabase/client";
import { performanceAnalytics } from "./performanceAnalytics";
import { validateBeforeEdgeFunction } from "./audioValidation";
import { sttServiceFactory } from "@/services/stt/STTServiceFactory";
import { STTTranscriptionResult } from "@/types/stt";

export interface ProcessingResult {
  success: boolean;
  originalText: string;
  translatedText?: string;
  audioData?: string;
  sttProvider?: string;
  error?: string;
}

export class PipelineOptimizer {
  async processAudioOptimized(
    audioData: string, 
    speaker: "A" | "B", 
    originalLang: string, 
    targetLang: string, 
    voiceToUse: string,
    onStepChange?: (step: string) => void
  ): Promise<ProcessingResult> {
    try {
      const timing = performanceAnalytics.startTiming(speaker, originalLang, targetLang);
      
      onStepChange?.("transcribing");
      
      // Audio validation
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
        estimatedDurationMs: validation.estimatedDurationMs
      });
      
      console.log('🚀 Starting STT using service factory...');

      // Speech-to-text using STT Service Factory
      const sttProvider = await sttServiceFactory.getProviderWithFallback();
      const sttResult: STTTranscriptionResult = await sttProvider.transcribe(audioData, originalLang);

      timing.recordStage('stt');
      
      console.log(`📥 STT response received from ${sttResult.provider}`);

      if (!sttResult.success) {
        console.error('❌ SPEECH-TO-TEXT ERROR:', {
          error: sttResult.error,
          provider: sttResult.provider,
          audioSample: audioData.slice(0, 50) + '...',
          requestPayloadSize: JSON.stringify({audio: audioData, language: originalLang}).length
        });
        
        let userError = 'Speech recognition failed';
        
        if (sttResult.error?.includes('API key') || sttResult.error?.includes('not configured')) {
          userError = 'Speech recognition service not configured - please contact administrator';
        } else if (sttResult.error?.includes('too short')) {
          userError = 'Please speak longer - minimum 0.5 seconds required';
        } else if (sttResult.error?.includes('too long')) {
          userError = 'Please speak shorter phrases - maximum 60 seconds allowed';
        } else if (sttResult.error?.includes('non-2xx')) {
          userError = 'Speech recognition service temporarily unavailable - please try again';
        } else if (sttResult.error?.includes('timeout')) {
          userError = 'Speech recognition timed out - please try shorter phrases';
        }
        
        throw new Error(userError);
      }
      
      if (!sttResult.text || sttResult.text.trim().length === 0) {
        console.error('❌ No transcription received:', sttResult);
        throw new Error('No speech detected - please speak clearly and try again');
      }

      const originalText = sttResult.text.trim();
      console.log(`✅ Transcription successful: "${originalText}" (${originalText.length} chars)`);
      console.log(`📊 Speech-to-text completed in ${timing.stages.stt || 0}ms using ${sttResult.provider}`);
      console.log(`Transcription (${speaker}):`, originalText);

      onStepChange?.("translating");

      // Translation
      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-text', {
        body: {
          text: originalText,
          fromLanguage: originalLang,
          toLanguage: targetLang
        }
      });

      timing.recordStage('translate');
      
      if (translateError) throw translateError;
      if (!translateData?.translatedText) throw new Error('Translation failed');

      const translatedText = translateData.translatedText;
      console.log(`Translation (${speaker}):`, translatedText);

      onStepChange?.("generating");

      // Text-to-speech
      const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: translatedText,
          voice: voiceToUse
        }
      });

      timing.recordStage('tts');

      if (ttsError) throw ttsError;
      if (!ttsData?.audioContent) throw new Error('No audio generated');

      timing.recordStage('total');
      performanceAnalytics.logTiming(timing);

      return {
        success: true,
        originalText,
        translatedText,
        audioData: ttsData.audioContent,
        sttProvider: sttResult.provider
      };

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
}

export const pipelineOptimizer = new PipelineOptimizer();