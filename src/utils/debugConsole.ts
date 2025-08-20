/**
 * COMPREHENSIVE DEBUG LOGGING FOR EDGE FUNCTION ERRORS
 * 
 * This utility provides detailed logging to help identify and fix edge function issues.
 * Use these functions to track down the root cause of any remaining errors.
 */

export const debugLog = {
  /**
   * Log audio processing details
   */
  audioProcessing: (data: {
    speaker: "A" | "B";
    audioLength: number;
    originalLang: string;
    targetLang: string;
    featureFlags: any;
  }) => {
    console.log('🎯 AUDIO PROCESSING DEBUG:', {
      timestamp: new Date().toISOString(),
      speaker: data.speaker,
      audioDataLength: data.audioLength,
      originalLanguage: data.originalLang,
      targetLanguage: data.targetLang,
      enabledFeatures: Object.keys(data.featureFlags || {}).filter(key => data.featureFlags[key]),
      audioSizeBytes: Math.round(data.audioLength * 0.75), // rough base64 to bytes
      estimatedDurationMs: Math.round((data.audioLength * 0.75) / 32000 * 1000)
    });
  },

  /**
   * Log edge function call details
   */
  edgeFunctionCall: (functionName: string, payload: any, payloadSize: number) => {
    console.log(`📡 EDGE FUNCTION CALL: ${functionName}`, {
      timestamp: new Date().toISOString(),
      function: functionName,
      payloadSize: payloadSize,
      payloadKeys: Object.keys(payload),
      audioDataSample: payload.audio ? payload.audio.slice(0, 50) + '...' : 'none',
      language: payload.language || payload.fromLanguage || payload.toLanguage
    });
  },

  /**
   * Log edge function response
   */
  edgeFunctionResponse: (functionName: string, data: any, error: any) => {
    if (error) {
      console.error(`❌ EDGE FUNCTION ERROR: ${functionName}`, {
        timestamp: new Date().toISOString(),
        function: functionName,
        error: error,
        errorMessage: error.message,
        errorContext: error.context,
        errorStack: error.stack
      });
    } else {
      console.log(`✅ EDGE FUNCTION SUCCESS: ${functionName}`, {
        timestamp: new Date().toISOString(),
        function: functionName,
        responseKeys: Object.keys(data || {}),
        dataPreview: data ? JSON.stringify(data).slice(0, 100) + '...' : 'empty'
      });
    }
  },

  /**
   * Log validation results
   */
  validation: (type: string, isValid: boolean, error?: string, details?: any) => {
    const logLevel = isValid ? 'log' : 'error';
    const icon = isValid ? '✅' : '❌';
    
    console[logLevel](`${icon} VALIDATION: ${type}`, {
      timestamp: new Date().toISOString(),
      type: type,
      isValid: isValid,
      error: error,
      details: details
    });
  },

  /**
   * Log UI state changes
   */
  uiState: (component: string, state: any) => {
    console.log(`🎨 UI STATE: ${component}`, {
      timestamp: new Date().toISOString(),
      component: component,
      state: state
    });
  },

  /**
   * Emergency error logging with full context
   */
  emergencyError: (context: string, error: any, additionalData?: any) => {
    console.error('🚨 EMERGENCY ERROR LOG', {
      timestamp: new Date().toISOString(),
      context: context,
      error: error,
      errorMessage: error?.message,
      errorStack: error?.stack,
      additionalData: additionalData,
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }
};

/**
 * Add debug logging to edge function calls
 */
export const wrapEdgeFunctionCall = async (
  functionName: string,
  supabaseCall: () => Promise<{ data: any, error: any }>,
  payload: any
) => {
  const payloadSize = JSON.stringify(payload).length;
  
  debugLog.edgeFunctionCall(functionName, payload, payloadSize);
  
  const startTime = performance.now();
  const result = await supabaseCall();
  const endTime = performance.now();
  
  debugLog.edgeFunctionResponse(functionName, result.data, result.error);
  
  console.log(`⏱️ ${functionName} took ${Math.round(endTime - startTime)}ms`);
  
  return result;
};

// Export for global access in development
if (typeof window !== 'undefined') {
  (window as any).debugLog = debugLog;
}