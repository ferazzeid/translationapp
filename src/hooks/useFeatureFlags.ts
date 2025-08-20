import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { settingsCache } from '@/utils/settingsCache';

export interface FeatureFlags {
  ttsPrewarm: boolean;
  parallelMTTTS: boolean;
  ttsStreaming: boolean;
  timingAnalytics: boolean;
  audioChunking: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  ttsPrewarm: true,
  parallelMTTTS: true,
  ttsStreaming: false,
  timingAnalytics: true,
  audioChunking: false, // Disabled - causes overhead for short audio
};

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      // Check cache first (5 minute expiry for feature flags)
      const cached = settingsCache.get<FeatureFlags>('feature_flags');
      if (cached) {
        console.log('useFeatureFlags: Using cached feature flags');
        setFlags(cached);
        setLoading(false);
        return;
      }

      console.log('useFeatureFlags: Loading feature flags from database...');
      const { data, error } = await supabase
        .from("admin_settings")
        .select("setting_key, setting_value")
        .in("setting_key", [
          "feat_tts_prewarm",
          "feat_parallel_mt_tts", 
          "feat_tts_streaming",
          "feat_timing_analytics",
          "feat_audio_chunking"
        ]);

      if (error) throw error;

      const newFlags = { ...DEFAULT_FLAGS };
      
      data?.forEach((setting) => {
        const value = setting.setting_value === "true";
        switch (setting.setting_key) {
          case "feat_tts_prewarm":
            newFlags.ttsPrewarm = value;
            break;
          case "feat_parallel_mt_tts":
            newFlags.parallelMTTTS = value;
            break;
          case "feat_tts_streaming":
            newFlags.ttsStreaming = false; // Force disable for now
            break;
          case "feat_timing_analytics":
            newFlags.timingAnalytics = value;
            break;
          case "feat_audio_chunking":
            newFlags.audioChunking = false; // Force disable for now
            break;
        }
      });

      // Cache for 5 minutes
      settingsCache.set('feature_flags', newFlags, 5);
      setFlags(newFlags);
    } catch (error) {
      console.error('Error loading feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  return { flags, loading, refetch: loadFeatureFlags };
};