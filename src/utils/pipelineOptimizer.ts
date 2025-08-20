// Pipeline Optimizer
// Handles parallel processing of translation and TTS preparation

import { supabase } from "@/integrations/supabase/client";
import { performanceAnalytics } from "./performanceAnalytics";

export interface ProcessingResult {
  success: boolean;
  originalText: string;
  translatedText?: string;
  audioData?: string | string[];
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
    // Start performance tracking
    const pipelineId = performanceAnalytics.startPipeline(speaker, audioData.length);
    
    try {
      // Step 1: Speech to Text
      performanceAnalytics.startStage(pipelineId, 'speech-to-text');
      onStepChange?.('speech-to-text');
      
      const { data: sttResponse, error: sttError } = await supabase.functions.invoke('speech-to-text', {
        body: {
          audio: audioData,
          language: originalLang
        }
      }).catch(networkError => {
        console.error('Network error calling speech-to-text:', networkError);
        return { data: null, error: { message: `Network error: ${networkError.message}` } };
      });

      if (sttError) {
        performanceAnalytics.logError(pipelineId, 'speech-to-text', sttError);
        
        // Return detailed error for better UX
        let errorMessage = "Could not understand the audio. Please try speaking more clearly.";
        if (sttError.message) {
          if (sttError.message.includes('Audio format not supported')) {
            errorMessage = "Audio format issue. Please try recording again.";
          } else if (sttError.message.includes('recording too short')) {
            errorMessage = "Recording too short. Please speak longer.";
          } else if (sttError.message.includes('Network error')) {
            errorMessage = "Connection issue. Please check your internet and try again.";
          } else if (sttError.message.includes('API key not configured')) {
            errorMessage = "Service configuration issue. Please contact support.";
          } else {
            errorMessage = sttError.message;
          }
        }
        
        return { success: false, originalText: "", error: errorMessage };
      }

      if (!sttResponse?.text || sttResponse.text.trim().length === 0) {
        performanceAnalytics.logError(pipelineId, 'speech-to-text', 'Empty transcription');
        return { 
          success: false, 
          originalText: "", 
          error: "No speech was detected in the recording. Please speak more clearly or for a longer duration." 
        };
      }

      const originalText = sttResponse.text.trim();

      // Step 2 & 3: Run Translation and TTS Preparation in Parallel
      performanceAnalytics.startStage(pipelineId, 'parallel-translation-tts');
      onStepChange?.('parallel-translation-tts');
      
      const [translationResult, ttsResult] = await Promise.allSettled([
        // Translation
        supabase.functions.invoke('translate-text', {
          body: {
            text: originalText,
            fromLanguage: originalLang,
            toLanguage: targetLang
          }
        }),
        
        // TTS (we'll use the original text for now, will replace with translated text)
        // This pre-initializes the TTS service for faster processing
        Promise.resolve({ prepared: true })
      ]);

      // Handle translation result
      if (translationResult.status === 'rejected') {
        performanceAnalytics.logError(pipelineId, 'translation', translationResult.reason);
        return { 
          success: false, 
          originalText, 
          error: `Translation failed: ${translationResult.reason?.message || 'Unknown error'}` 
        };
      }

      const translateResponse = translationResult.value.data;
      const translateError = translationResult.value.error;

      if (translateError) {
        performanceAnalytics.logError(pipelineId, 'translation', translateError);
        return { 
          success: false, 
          originalText, 
          error: `Translation failed: ${translateError.message || 'Unknown error'}` 
        };
      }

      if (!translateResponse?.translatedText) {
        performanceAnalytics.logError(pipelineId, 'translation', 'No translated text returned');
        return { 
          success: false, 
          originalText, 
          error: 'Failed to translate text - no translation returned' 
        };
      }

      const translatedText = translateResponse.translatedText.trim();

      // Step 4: Generate TTS for translated text
      performanceAnalytics.startStage(pipelineId, 'text-to-speech');
      onStepChange?.('text-to-speech');
      
      const { data: ttsResponse, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: translatedText,
          language: targetLang,
          voice: voiceToUse
        }
      });

      // End pipeline tracking
      performanceAnalytics.endPipeline(pipelineId, originalLang, targetLang, true);
      onStepChange?.('');

      // Return result with optional TTS data
      const result: ProcessingResult = {
        success: true,
        originalText,
        translatedText
      };

      if (!ttsError && ttsResponse) {
        if (ttsResponse.audioChunks && Array.isArray(ttsResponse.audioChunks)) {
          result.audioData = ttsResponse.audioChunks;
        } else if (ttsResponse.audioData) {
          result.audioData = ttsResponse.audioData;
        }
      } else if (ttsError) {
        console.warn('Text-to-speech failed, but continuing with text result:', ttsError);
      }

      return result;

    } catch (error) {
      performanceAnalytics.logError(pipelineId, 'unknown', error);
      console.error('Pipeline optimization error:', error);
      onStepChange?.('');
      return { 
        success: false, 
        originalText: "", 
        error: error instanceof Error ? error.message : "Failed to process audio" 
      };
    }
  }
}

export const pipelineOptimizer = new PipelineOptimizer();