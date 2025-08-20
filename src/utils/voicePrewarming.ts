// Voice Prewarming System
// Warms up TTS voices on session start to eliminate first-use delay

import { supabase } from "@/integrations/supabase/client";

interface PrewarmingCache {
  [voiceId: string]: {
    prewarmed: boolean;
    timestamp: number;
  };
}

class VoicePrewarmingService {
  private cache: PrewarmingCache = {};
  private readonly PREWARM_TEXT = "Hi"; // 200ms of audio
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  async prewarmVoice(voiceId: string, language: string = "English"): Promise<boolean> {
    // Check if already prewarmed recently
    if (this.isVoicePrewarmed(voiceId)) {
      console.log(`🔥 Voice ${voiceId} already prewarmed`);
      return true;
    }

    try {
      console.log(`🔥 Prewarming voice: ${voiceId}`);
      const startTime = performance.now();

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: this.PREWARM_TEXT,
          language: language,
          voice: voiceId
        }
      });

      const duration = performance.now() - startTime;

      if (error) {
        console.warn(`⚠️  Voice prewarming failed for ${voiceId}:`, error);
        return false;
      }

      // Mark as prewarmed
      this.cache[voiceId] = {
        prewarmed: true,
        timestamp: Date.now()
      };

      console.log(`✅ Voice ${voiceId} prewarmed in ${duration.toFixed(0)}ms`);
      return true;
    } catch (error) {
      console.error(`❌ Voice prewarming error for ${voiceId}:`, error);
      return false;
    }
  }

  async prewarmVoicePair(
    speakerAVoice: string, 
    speakerBVoice: string,
    speakerALanguage: string = "English",
    speakerBLanguage: string = "English"
  ): Promise<void> {
    console.log(`🔥 Starting voice pair prewarming...`);
    const startTime = performance.now();

    // Prewarm both voices in parallel
    const [resultA, resultB] = await Promise.allSettled([
      this.prewarmVoice(speakerAVoice, speakerALanguage),
      this.prewarmVoice(speakerBVoice, speakerBLanguage)
    ]);

    const duration = performance.now() - startTime;
    const successCount = [resultA, resultB].filter(r => r.status === 'fulfilled' && r.value).length;

    console.log(`🔥 Voice pair prewarming completed: ${successCount}/2 voices in ${duration.toFixed(0)}ms`);
  }

  isVoicePrewarmed(voiceId: string): boolean {
    const cached = this.cache[voiceId];
    if (!cached) return false;

    // Check if cache is still valid
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      delete this.cache[voiceId];
      return false;
    }

    return cached.prewarmed;
  }

  clearCache(): void {
    this.cache = {};
    console.log('🧹 Voice prewarming cache cleared');
  }

  getCacheStatus(): { [voiceId: string]: boolean } {
    const status: { [voiceId: string]: boolean } = {};
    
    Object.keys(this.cache).forEach(voiceId => {
      status[voiceId] = this.isVoicePrewarmed(voiceId);
    });

    return status;
  }
}

export const voicePrewarming = new VoicePrewarmingService();