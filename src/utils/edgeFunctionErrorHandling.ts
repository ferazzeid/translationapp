/**
 * CRITICAL ERROR PREVENTION GUIDE FOR EDGE FUNCTIONS
 * 
 * This file contains essential guidelines to prevent "Edge Function returned non-2xx status code" errors.
 * These errors typically occur due to parameter mismatches between client calls and edge function expectations.
 * 
 * FOLLOW THESE RULES RELIGIOUSLY TO AVOID BREAKING THE APPLICATION:
 */

export const EDGE_FUNCTION_CONTRACTS = {
  /**
   * SPEECH-TO-TEXT FUNCTION
   * Expected input format: JSON object with base64 audio string
   * NEVER send FormData - it will cause JSON parsing errors!
   */
  'speech-to-text': {
    expectedBody: {
      audio: 'string (base64)', // NOT a Blob or File object
      language: 'string (language code like "en", "hu")'
    },
    commonErrors: [
      'Sending FormData instead of JSON - causes "No number after minus sign in JSON" error',
      'Sending Blob directly - function expects base64 string',
      'Wrong language parameter name'
    ]
  },

  /**
   * TRANSLATE-TEXT FUNCTION  
   * Expected input format: JSON object with specific parameter names
   */
  'translate-text': {
    expectedBody: {
      text: 'string',
      fromLanguage: 'string', // NOT sourceLang!
      toLanguage: 'string'    // NOT targetLang!
    },
    commonErrors: [
      'Using sourceLang/targetLang instead of fromLanguage/toLanguage',
      'Missing required parameters'
    ]
  },

  /**
   * TEXT-TO-SPEECH FUNCTION
   * Expected input format: JSON object
   */
  'text-to-speech': {
    expectedBody: {
      text: 'string',
      voice: 'string',
      language: 'string (optional)'
    },
    commonErrors: [
      'Missing voice parameter',
      'Wrong voice name format'
    ]
  }
} as const;

/**
 * BEFORE MODIFYING PIPELINE OPTIMIZER OR EDGE FUNCTION CALLS:
 * 
 * 1. Check the actual edge function code to see expected parameter names
 * 2. Verify the input format (JSON vs FormData)  
 * 3. Test with a simple call first before implementing complex features
 * 4. Always handle conversion from Blob to base64 for audio functions
 * 5. Use consistent parameter names across all calls
 * 
 * REMEMBER: Edge functions fail silently and return 500 errors when given wrong input format!
 */

/**
 * Utility function to convert Blob to base64 string
 * Use this for all audio data sent to speech-to-text function
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Utility function to safely call speech-to-text function
 * This prevents the most common cause of edge function errors
 */
export const safeSpeechToText = async (audioBlob: Blob, language: string) => {
  const audioBase64 = await blobToBase64(audioBlob);
  
  return {
    body: {
      audio: audioBase64,
      language: language
    }
  };
};

/**
 * Utility function to safely call translate-text function
 * This ensures correct parameter names are used
 */
export const safeTranslateText = (text: string, fromLang: string, toLang: string) => {
  return {
    body: {
      text: text,
      fromLanguage: fromLang, // NOT sourceLang
      toLanguage: toLang      // NOT targetLang
    }
  };
};