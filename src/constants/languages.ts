export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  // Major world languages
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh", name: "Chinese (Mandarin)", flag: "🇨🇳" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  
  // European languages
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "sk", name: "Slovak", flag: "🇸🇰" },
  { code: "sl", name: "Slovenian", flag: "🇸🇮" },
  { code: "hr", name: "Croatian", flag: "🇭🇷" },
  { code: "sr", name: "Serbian", flag: "🇷🇸" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "he", name: "Hebrew", flag: "🇮🇱" },
  { code: "is", name: "Icelandic", flag: "🇮🇸" },
  { code: "lv", name: "Latvian", flag: "🇱🇻" },
  { code: "lt", name: "Lithuanian", flag: "🇱🇹" },
  { code: "et", name: "Estonian", flag: "🇪🇪" },
  { code: "mt", name: "Maltese", flag: "🇲🇹" },
  { code: "ga", name: "Irish", flag: "🇮🇪" },
  { code: "cy", name: "Welsh", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { code: "eu", name: "Basque", flag: "🇪🇸" },
  { code: "ca", name: "Catalan", flag: "🇪🇸" },
  
  // Asian languages
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "tl", name: "Filipino", flag: "🇵🇭" },
  { code: "bn", name: "Bengali", flag: "🇧🇩" },
  { code: "ur", name: "Urdu", flag: "🇵🇰" },
  { code: "fa", name: "Persian (Farsi)", flag: "🇮🇷" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", flag: "🇮🇳" },
  { code: "ne", name: "Nepali", flag: "🇳🇵" },
  { code: "si", name: "Sinhala", flag: "🇱🇰" },
  { code: "my", name: "Myanmar (Burmese)", flag: "🇲🇲" },
  { code: "km", name: "Khmer", flag: "🇰🇭" },
  { code: "lo", name: "Lao", flag: "🇱🇦" },
  { code: "ka", name: "Georgian", flag: "🇬🇪" },
  { code: "hy", name: "Armenian", flag: "🇦🇲" },
  { code: "az", name: "Azerbaijani", flag: "🇦🇿" },
  { code: "kk", name: "Kazakh", flag: "🇰🇿" },
  { code: "ky", name: "Kyrgyz", flag: "🇰🇬" },
  { code: "uz", name: "Uzbek", flag: "🇺🇿" },
  { code: "tj", name: "Tajik", flag: "🇹🇯" },
  { code: "tk", name: "Turkmen", flag: "🇹🇲" },
  { code: "mn", name: "Mongolian", flag: "🇲🇳" },
  
  // African languages
  { code: "sw", name: "Swahili", flag: "🇰🇪" },
  { code: "am", name: "Amharic", flag: "🇪🇹" },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
  { code: "yo", name: "Yoruba", flag: "🇳🇬" },
  { code: "ig", name: "Igbo", flag: "🇳🇬" },
  { code: "zu", name: "Zulu", flag: "🇿🇦" },
  { code: "af", name: "Afrikaans", flag: "🇿🇦" },
  { code: "so", name: "Somali", flag: "🇸🇴" },
  { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
  { code: "mg", name: "Malagasy", flag: "🇲🇬" },
  
  // Other major languages
  { code: "la", name: "Latin", flag: "🇻🇦" },
  { code: "sa", name: "Sanskrit", flag: "🇮🇳" },
  { code: "eo", name: "Esperanto", flag: "🌍" },
  { code: "jv", name: "Javanese", flag: "🇮🇴" },
  { code: "su", name: "Sundanese", flag: "🇮🇩" },
  { code: "ceb", name: "Cebuano", flag: "🇵🇭" },
  { code: "ny", name: "Chichewa", flag: "🇲🇼" },
  { code: "co", name: "Corsican", flag: "🇫🇷" },
  { code: "fy", name: "Frisian", flag: "🇳🇱" },
  { code: "gd", name: "Scottish Gaelic", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { code: "gl", name: "Galician", flag: "🇪🇸" },
  { code: "haw", name: "Hawaiian", flag: "🇺🇸" },
  { code: "hmn", name: "Hmong", flag: "🇨🇳" },
  { code: "lb", name: "Luxembourgish", flag: "🇱🇺" },
  { code: "mk", name: "Macedonian", flag: "🇲🇰" },
  { code: "mi", name: "Maori", flag: "🇳🇿" },
  { code: "sm", name: "Samoan", flag: "🇼🇸" },
  { code: "sn", name: "Shona", flag: "🇿🇼" },
  { code: "st", name: "Sesotho", flag: "🇱🇸" },
  { code: "xh", name: "Xhosa", flag: "🇿🇦" },
  { code: "yi", name: "Yiddish", flag: "🇮🇱" },
  
  // Regional variants
  { code: "pt-br", name: "Portuguese (Brazil)", flag: "🇧🇷" },
  { code: "es-mx", name: "Spanish (Mexico)", flag: "🇲🇽" },
  { code: "es-ar", name: "Spanish (Argentina)", flag: "🇦🇷" },
  { code: "fr-ca", name: "French (Canada)", flag: "🇨🇦" },
  { code: "en-gb", name: "English (UK)", flag: "🇬🇧" },
  { code: "en-au", name: "English (Australia)", flag: "🇦🇺" },
  { code: "zh-tw", name: "Chinese (Traditional)", flag: "🇹🇼" },
  { code: "zh-hk", name: "Chinese (Hong Kong)", flag: "🇭🇰" },
];

export const getLanguageName = (code: string): string => {
  return LANGUAGES.find(lang => lang.code === code)?.name || "Unknown Language";
};

export const getLanguageFlag = (code: string): string => {
  return LANGUAGES.find(lang => lang.code === code)?.flag || "🌍";
};
