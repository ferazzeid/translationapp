# CRITICAL ERROR PREVENTION GUIDE

## Edge Function "non-2xx status code" Prevention

This document contains the comprehensive solution to prevent the recurring "Edge Function returned non-2xx status code" errors that have plagued this application.

### Root Causes Identified and Fixed:

1. **Audio Data Format Issues**
   - ❌ **NEVER** send FormData to speech-to-text function
   - ✅ **ALWAYS** send JSON with base64 audio string
   - ✅ **ALWAYS** validate base64 format before sending
   - ✅ **ALWAYS** use `validateBeforeEdgeFunction()` utility

2. **Parameter Name Mismatches**
   - ❌ Using `sourceLang`/`targetLang` for translate-text function
   - ✅ Use `fromLanguage`/`toLanguage` for translate-text function
   - ✅ Check edge function contracts in `edgeFunctionErrorHandling.ts`

3. **Audio Data Corruption**
   - ❌ Double-converting base64 → blob → base64
   - ✅ Use audio data directly from recorder (already base64)
   - ✅ Validate audio size and format before processing

### Mandatory Validation Checklist:

Before ANY edge function call, you MUST:

1. ✅ Call `validateBeforeEdgeFunction()` from `audioValidation.ts`
2. ✅ Check audio data is valid base64 string
3. ✅ Verify audio size is between 100 bytes and 25MB
4. ✅ Ensure languages are specified and different
5. ✅ Use correct parameter names for each function
6. ✅ Log comprehensive error details for debugging

### Files That Prevent This Error:

- `src/utils/audioValidation.ts` - Comprehensive validation
- `src/utils/edgeFunctionErrorHandling.ts` - Error prevention guide
- `src/utils/pipelineOptimizer.ts` - Enhanced error handling
- `src/utils/errorPrevention.md` - This documentation

### How to Add New Edge Function Calls:

```typescript
// 1. ALWAYS validate first
const validation = validateBeforeEdgeFunction(audioData, fromLang, toLang, speaker);
if (!validation.isValid) {
  throw new Error(validation.error);
}

// 2. Use exact parameter names expected by function
const { data, error } = await supabase.functions.invoke('function-name', {
  body: {
    // Use EXACT parameter names from edge function code
    audio: audioData, // NOT audioBlob, NOT formData
    language: fromLang // NOT sourceLang
  }
});

// 3. Handle errors with specific messages
if (error) {
  console.error('Edge function error details:', error);
  throw new Error(getUserFriendlyErrorMessage(error));
}
```

### UI Duplication Prevention:

The duplicate "Listening..." indicators were caused by:
- `CentralStatusDisplay` showing "Listening to Speaker X"
- `SpeakerStatusMessage` also showing "Listening..."

**Fix Applied:**
- `CentralStatusDisplay` shows "Recording Speaker X" during recording
- `SpeakerStatusMessage` is hidden during recording (returns null)
- Only processing states are shown in individual speaker messages

### Security Hardening:

Once the errors are resolved, implement these security measures:

1. **Input Sanitization**
   - Validate all user inputs before processing
   - Sanitize text content before translation
   - Check audio data integrity

2. **Rate Limiting**
   - Implement request rate limiting per user
   - Prevent abuse of edge functions
   - Add cooldown periods for repeated failures

3. **Error Information Security**
   - Don't expose internal system details in error messages
   - Log detailed errors server-side only
   - Show user-friendly messages to clients

### Testing Protocol:

After any changes to edge function calls:

1. ✅ Test with short audio (< 1 second)
2. ✅ Test with long audio (> 10 seconds)
3. ✅ Test with invalid audio data
4. ✅ Test with missing parameters
5. ✅ Test with incorrect parameter names
6. ✅ Test network failure scenarios
7. ✅ Verify error messages are user-friendly

### Emergency Rollback:

If errors persist after changes:

1. Check `validateBeforeEdgeFunction()` is being called
2. Verify edge function parameter names match exactly
3. Ensure audio data is pure base64 (no data URL prefix)
4. Check console logs for validation failures
5. Restore from working commit if necessary

---

**REMEMBER: These errors are 100% preventable by following this guide!**