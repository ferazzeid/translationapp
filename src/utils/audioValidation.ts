/**
 * CRITICAL AUDIO VALIDATION UTILITY
 * 
 * This module contains comprehensive audio validation functions to prevent
 * "Edge Function returned non-2xx status code" errors that have plagued this application.
 * 
 * ALWAYS use these validation functions before sending audio data to edge functions!
 */

export interface AudioValidationResult {
  isValid: boolean;
  error?: string;
  audioSizeBytes?: number;
  estimatedDurationMs?: number;
}

/**
 * Validates base64 audio data before sending to speech-to-text function
 * This prevents the majority of edge function failures
 */
export const validateAudioData = (audioData: string): AudioValidationResult => {
  console.log('🔍 Starting audio validation...');
  
  // Check 1: Audio data exists and is string
  if (!audioData || typeof audioData !== 'string') {
    return {
      isValid: false,
      error: 'Audio data must be a non-empty string'
    };
  }
  
  // Check 2: Audio data has minimum length
  if (audioData.length === 0) {
    return {
      isValid: false,
      error: 'Audio data is empty - recording too short'
    };
  }
  
  // Check 3: Validate base64 format
  try {
    // Test decode first 100 characters to verify it's valid base64
    const testSample = audioData.slice(0, Math.min(100, audioData.length));
    const testDecode = atob(testSample);
    
    if (testDecode.length === 0) {
      return {
        isValid: false,
        error: 'Audio data is not valid base64 format'
      };
    }
  } catch (e) {
    return {
      isValid: false,
      error: `Invalid base64 format: ${e.message}`
    };
  }
  
  // Check 4: Estimate audio size
  let audioSizeBytes = 0;
  try {
    const binaryString = atob(audioData);
    audioSizeBytes = binaryString.length;
  } catch (e) {
    return {
      isValid: false,
      error: `Cannot calculate audio size: ${e.message}`
    };
  }
  
  // Check 5: Audio size limits (based on speech-to-text function limits)
  if (audioSizeBytes < 100) {
    return {
      isValid: false,
      error: 'Audio recording too short - please speak longer'
    };
  }
  
  if (audioSizeBytes > 25 * 1024 * 1024) { // 25MB limit from edge function
    return {
      isValid: false,
      error: 'Audio recording too long - please speak shorter phrases'
    };
  }
  
  // Check 6: Estimate duration (rough approximation)
  // Assuming ~16kHz, 16-bit, mono = ~32KB per second
  const estimatedDurationMs = (audioSizeBytes / 32000) * 1000;
  
  if (estimatedDurationMs < 500) { // Less than 0.5 seconds
    return {
      isValid: false,
      error: 'Audio recording too short - minimum 0.5 seconds required'
    };
  }
  
  if (estimatedDurationMs > 60000) { // More than 60 seconds
    return {
      isValid: false,
      error: 'Audio recording too long - maximum 60 seconds allowed'
    };
  }
  
  console.log('✅ Audio validation passed:', {
    sizeBytes: audioSizeBytes,
    estimatedDurationMs: Math.round(estimatedDurationMs),
    base64Length: audioData.length
  });
  
  return {
    isValid: true,
    audioSizeBytes,
    estimatedDurationMs
  };
};

/**
 * Validates language parameters to prevent edge function errors
 */
export const validateLanguages = (originalLang: string, targetLang: string): AudioValidationResult => {
  if (!originalLang || typeof originalLang !== 'string') {
    return {
      isValid: false,
      error: 'Original language must be specified'
    };
  }
  
  if (!targetLang || typeof targetLang !== 'string') {
    return {
      isValid: false,
      error: 'Target language must be specified'
    };
  }
  
  if (originalLang === targetLang) {
    return {
      isValid: false,
      error: 'Original and target languages cannot be the same'
    };
  }
  
  return { isValid: true };
};

/**
 * Comprehensive validation before any edge function call
 * USE THIS FUNCTION to prevent all known edge function errors!
 */
export const validateBeforeEdgeFunction = (
  audioData: string,
  originalLang: string,
  targetLang: string,
  speaker: "A" | "B"
): AudioValidationResult => {
  console.log('🔍 Starting comprehensive validation for edge function call...');
  
  // Validate audio data
  const audioValidation = validateAudioData(audioData);
  if (!audioValidation.isValid) {
    return audioValidation;
  }
  
  // Validate languages
  const languageValidation = validateLanguages(originalLang, targetLang);
  if (!languageValidation.isValid) {
    return languageValidation;
  }
  
  // Validate speaker
  if (!speaker || (speaker !== "A" && speaker !== "B")) {
    return {
      isValid: false,
      error: 'Speaker must be "A" or "B"'
    };
  }
  
  console.log('✅ All validations passed - safe to call edge function');
  
  return {
    isValid: true,
    audioSizeBytes: audioValidation.audioSizeBytes,
    estimatedDurationMs: audioValidation.estimatedDurationMs
  };
};