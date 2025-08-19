// ============================================================================
// PROTECTED CONSTANTS - DO NOT MODIFY WITHOUT CAREFUL CONSIDERATION
// ============================================================================
// This file contains critical constants that should remain stable to prevent
// breaking voice processing, audio handling, language mapping, and theming.
// Any changes here should be thoroughly tested.
// ============================================================================

/**
 * PROTECTED: Voice defaults for gender-based selection
 * These are deterministic choices to prevent random voice assignment issues
 */
export const PROTECTED_VOICE_DEFAULTS = {
  MALE: 'onyx',   // DO NOT CHANGE - User specifically requested onyx for male
  FEMALE: 'alloy', // DO NOT CHANGE - User specifically requested alloy for female
  FALLBACK: 'alloy' // Safe fallback if gender detection fails
} as const;

/**
 * PROTECTED: Available OpenAI TTS voices
 * These are the validated voice options that work with OpenAI's TTS API
 */
export const PROTECTED_AVAILABLE_VOICES = [
  'alloy',
  'echo', 
  'fable',
  'nova',
  'onyx',
  'shimmer'
] as const;

/**
 * PROTECTED: Language code mappings
 * These mappings are critical for proper speech-to-text and translation
 * DO NOT MODIFY - These are used by OpenAI API and must be accurate
 */
export const PROTECTED_LANGUAGE_MAPPING = {
  "Afrikaans": "AF",
  "Albanian": "SQ", 
  "Arabic": "AR",
  "Armenian": "HY",
  "Azerbaijani": "AZ",
  "Basque": "EU",
  "Belarusian": "BE",
  "Bengali": "BN",
  "Bosnian": "BS",
  "Bulgarian": "BG",
  "Catalan": "CA",
  "Chinese (Simplified)": "ZH",
  "Chinese (Traditional)": "ZH",
  "Croatian": "HR",
  "Czech": "CS",
  "Danish": "DA",
  "Dutch": "NL",
  "English": "EN",
  "Estonian": "ET",
  "Filipino": "TL", // FIXED: Was incorrectly "FI" (conflicted with Finnish)
  "Finnish": "FI",
  "French": "FR",
  "Galician": "GL",
  "Georgian": "KA",
  "German": "DE",
  "Greek": "EL",
  "Gujarati": "GU",
  "Hebrew": "HE",
  "Hindi": "HI",
  "Hungarian": "HU",
  "Icelandic": "IS",
  "Indonesian": "ID",
  "Irish": "GA",
  "Italian": "IT",
  "Japanese": "JA",
  "Kannada": "KN",
  "Kazakh": "KK",
  "Korean": "KO",
  "Latvian": "LV",
  "Lithuanian": "LT",
  "Luxembourgish": "LB",
  "Macedonian": "MK",
  "Malay": "MS",
  "Malayalam": "ML",
  "Maltese": "MT",
  "Marathi": "MR",
  "Norwegian": "NO",
  "Persian": "FA",
  "Polish": "PL",
  "Portuguese": "PT",
  "Punjabi": "PA",
  "Romanian": "RO",
  "Russian": "RU",
  "Serbian": "SR",
  "Slovak": "SK",
  "Slovenian": "SL",
  "Spanish": "ES",
  "Swahili": "SW",
  "Swedish": "SV",
  "Tamil": "TA",
  "Telugu": "TE",
  "Thai": "TH",
  "Turkish": "TR",
  "Ukrainian": "UK",
  "Urdu": "UR",
  "Vietnamese": "VI",
  "Welsh": "CY"
} as const;

/**
 * PROTECTED: Audio processing constants
 * These values are optimized for browser audio recording and OpenAI Whisper
 */
export const PROTECTED_AUDIO_CONSTANTS = {
  CHUNK_SIZE: 32768, // 32KB chunks for memory-safe base64 processing
  DEFAULT_MIME_TYPE: 'audio/webm', // Most reliable for browser recordings
  DEFAULT_FILE_NAME: 'audio.webm',
  MAX_AUDIO_SIZE: 25 * 1024 * 1024 // 25MB limit for OpenAI Whisper
} as const;

/**
 * PROTECTED: Theme-related constants
 * These ensure theme stability and prevent button visibility issues
 */
export const PROTECTED_THEME_CONSTANTS = {
  DEFAULT_THEME: 'corporate' as const,
  AVAILABLE_THEMES: ['corporate', 'minimalist', 'dark'] as const,
  STORAGE_KEY: 'ui.theme'
} as const;

/**
 * PROTECTED: Voice preference storage keys
 * These keys are used for localStorage persistence
 */
export const PROTECTED_STORAGE_KEYS = {
  VOICE_PREFERENCES: 'voice-preferences',
  SPEAKER_A_VOICE: 'speaker-a-voice',
  SPEAKER_B_VOICE: 'speaker-b-voice'
} as const;

/**
 * Validation function to ensure constants haven't been corrupted
 * This runs at startup to catch any accidental modifications
 */
export function validateProtectedConstants(): boolean {
  try {
    // Validate voice defaults are still valid OpenAI voices
    const isValidVoice = (voice: string) => PROTECTED_AVAILABLE_VOICES.includes(voice as any);
    
    if (!isValidVoice(PROTECTED_VOICE_DEFAULTS.MALE)) {
      console.error('PROTECTION ERROR: Male default voice is invalid');
      return false;
    }
    
    if (!isValidVoice(PROTECTED_VOICE_DEFAULTS.FEMALE)) {
      console.error('PROTECTION ERROR: Female default voice is invalid');
      return false;
    }
    
    // Validate critical language mappings
    if (PROTECTED_LANGUAGE_MAPPING.Filipino !== "TL") {
      console.error('PROTECTION ERROR: Filipino language code is incorrect (should be TL)');
      return false;
    }
    
    if (PROTECTED_LANGUAGE_MAPPING.Finnish !== "FI") {
      console.error('PROTECTION ERROR: Finnish language code is incorrect (should be FI)');
      return false;
    }
    
    // Validate audio constants are reasonable
    if (PROTECTED_AUDIO_CONSTANTS.CHUNK_SIZE < 1024 || PROTECTED_AUDIO_CONSTANTS.CHUNK_SIZE > 1048576) {
      console.error('PROTECTION ERROR: Audio chunk size is out of safe range');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('PROTECTION ERROR: Failed to validate constants', error);
    return false;
  }
}