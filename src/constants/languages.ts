export const LANGUAGES = [
  "Afrikaans",
  "Albanian", 
  "Arabic",
  "Armenian",
  "Azerbaijani",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bosnian",
  "Bulgarian",
  "Catalan",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Estonian",
  "Filipino",
  "Finnish",
  "French",
  "Galician",
  "Georgian",
  "German",
  "Greek",
  "Gujarati",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Icelandic",
  "Indonesian",
  "Irish",
  "Italian",
  "Japanese",
  "Kannada",
  "Kazakh",
  "Korean",
  "Latvian",
  "Lithuanian",
  "Luxembourgish",
  "Macedonian",
  "Malay",
  "Malayalam",
  "Maltese",
  "Marathi",
  "Norwegian",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Serbian",
  "Slovak",
  "Slovenian",
  "Spanish",
  "Swahili",
  "Swedish",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Vietnamese",
  "Welsh"
];

// PROTECTED FUNCTION - DO NOT MODIFY
// This language mapping is critical for proper speech-to-text and translation
// Any changes can break OpenAI API integration and language detection
export const getLanguageCode = (language: string): string => {
  const { PROTECTED_LANGUAGE_MAPPING } = require('@/constants/protected');
  
  // Validate the mapping exists and hasn't been corrupted
  if (!PROTECTED_LANGUAGE_MAPPING[language as keyof typeof PROTECTED_LANGUAGE_MAPPING]) {
    console.warn(`Language code not found for: ${language}, using EN as fallback`);
    return "EN";
  }
  
  return PROTECTED_LANGUAGE_MAPPING[language as keyof typeof PROTECTED_LANGUAGE_MAPPING] || "EN";
};