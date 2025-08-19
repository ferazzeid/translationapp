// PROTECTED UTILITY - Voice preference management
// Handles localStorage persistence for user voice selections
// DO NOT MODIFY - Critical for voice selection stability

import { PROTECTED_STORAGE_KEYS, PROTECTED_VOICE_DEFAULTS } from '@/constants/protected';

export interface VoicePreferences {
  speakerA: string;
  speakerB: string;
}

/**
 * PROTECTED: Load voice preferences from localStorage
 */
export function loadVoicePreferences(): VoicePreferences {
  try {
    const stored = localStorage.getItem(PROTECTED_STORAGE_KEYS.VOICE_PREFERENCES);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that stored voices are still valid
      return {
        speakerA: parsed.speakerA || PROTECTED_VOICE_DEFAULTS.MALE,
        speakerB: parsed.speakerB || PROTECTED_VOICE_DEFAULTS.FEMALE
      };
    }
  } catch (error) {
    console.warn('Failed to load voice preferences from localStorage:', error);
  }
  
  // Return defaults if no stored preferences or error
  return {
    speakerA: PROTECTED_VOICE_DEFAULTS.MALE,
    speakerB: PROTECTED_VOICE_DEFAULTS.FEMALE
  };
}

/**
 * PROTECTED: Save voice preferences to localStorage
 */
export function saveVoicePreferences(preferences: VoicePreferences): void {
  try {
    localStorage.setItem(PROTECTED_STORAGE_KEYS.VOICE_PREFERENCES, JSON.stringify(preferences));
    console.log('Voice preferences saved:', preferences);
  } catch (error) {
    console.error('Failed to save voice preferences to localStorage:', error);
  }
}

/**
 * PROTECTED: Get voice for specific speaker
 */
export function getVoiceForSpeaker(speaker: 'A' | 'B'): string {
  const preferences = loadVoicePreferences();
  return speaker === 'A' ? preferences.speakerA : preferences.speakerB;
}

/**
 * PROTECTED: Set voice for specific speaker
 */
export function setVoiceForSpeaker(speaker: 'A' | 'B', voice: string): void {
  const preferences = loadVoicePreferences();
  
  if (speaker === 'A') {
    preferences.speakerA = voice;
  } else {
    preferences.speakerB = voice;
  }
  
  saveVoicePreferences(preferences);
}

/**
 * PROTECTED: Clear all voice preferences (for testing or reset)
 */
export function clearVoicePreferences(): void {
  try {
    localStorage.removeItem(PROTECTED_STORAGE_KEYS.VOICE_PREFERENCES);
    console.log('Voice preferences cleared');
  } catch (error) {
    console.error('Failed to clear voice preferences:', error);
  }
}