import { useState, useCallback } from 'react';

export interface VoiceGenderResult {
  gender: 'male' | 'female' | 'unknown';
  confidence: number;
}

export const useVoiceGenderDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);

  const detectGender = useCallback(async (audioBlob: Blob): Promise<VoiceGenderResult> => {
    setIsDetecting(true);
    
    try {
      // For now, we'll use a simple heuristic based on audio frequency analysis
      // This is a basic implementation - in production you'd use ML models
      const audioContext = new AudioContext();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Simple frequency analysis
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      
      // Calculate average fundamental frequency (simplified)
      let sum = 0;
      let count = 0;
      
      // Look for patterns in the audio data
      for (let i = 0; i < channelData.length - 1000; i += 1000) {
        const slice = channelData.slice(i, i + 1000);
        const avg = slice.reduce((acc, val) => acc + Math.abs(val), 0) / slice.length;
        if (avg > 0.01) { // Only count significant audio
          sum += avg;
          count++;
        }
      }
      
      const avgAmplitude = count > 0 ? sum / count : 0;
      
      // Simple heuristic: higher frequency patterns tend to be female voices
      // This is very basic and not accurate - just a starting point
      const isFemale = avgAmplitude > 0.03;
      
      await audioContext.close();
      
      return {
        gender: isFemale ? 'female' : 'male',
        confidence: 0.6 // Low confidence as this is a basic implementation
      };
    } catch (error) {
      console.error('Voice gender detection failed:', error);
      return {
        gender: 'unknown',
        confidence: 0
      };
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const getDefaultVoiceForGender = useCallback((gender: 'male' | 'female' | 'unknown'): string => {
    const maleVoices = ['echo', 'fable', 'onyx'];
    const femaleVoices = ['alloy', 'nova', 'shimmer'];
    
    switch (gender) {
      case 'male':
        return maleVoices[Math.floor(Math.random() * maleVoices.length)];
      case 'female':
        return femaleVoices[Math.floor(Math.random() * femaleVoices.length)];
      default:
        return 'alloy'; // Default fallback
    }
  }, []);

  return {
    detectGender,
    getDefaultVoiceForGender,
    isDetecting
  };
};