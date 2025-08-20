import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export const PerformanceSettings = () => {
  const [ttsPrewarm, setTtsPrewarm] = useState(true);
  const [parallelMTTTS, setParallelMTTTS] = useState(true);
  const [ttsStreaming, setTtsStreaming] = useState(false);
  const [timingAnalytics, setTimingAnalytics] = useState(true);
  const [audioChunking, setAudioChunking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
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

      data?.forEach((setting) => {
        const value = setting.setting_value === "true";
        switch (setting.setting_key) {
          case "feat_tts_prewarm":
            setTtsPrewarm(value);
            break;
          case "feat_parallel_mt_tts":
            setParallelMTTTS(value);
            break;
          case "feat_tts_streaming":
            setTtsStreaming(value);
            break;
          case "feat_timing_analytics":
            setTimingAnalytics(value);
            break;
          case "feat_audio_chunking":
            setAudioChunking(value);
            break;
        }
      });
    } catch (error: any) {
      console.error('Error loading performance settings:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      const { error } = await supabase.rpc("set_admin_setting", {
        key_name: key,
        value: value.toString(),
        encrypted: false
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Performance setting updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save setting: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (key: string, value: boolean, setter: (value: boolean) => void) => {
    setter(value);
    await updateSetting(key, value);
  };

  return (
    <Card className="theme-surface theme-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          <Zap className="h-5 w-5 theme-icon" />
          <span className="theme-text">Performance Optimizations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* TTS Prewarming */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium theme-text">TTS Prewarming</h3>
            <Badge variant="secondary" className="text-xs">Phase 1</Badge>
          </div>
          <p className="text-sm theme-text-muted">
            Warm up voice synthesis at session start to eliminate first-use delay (~200-500ms improvement)
          </p>
          <div className="flex items-center justify-between">
            <Label htmlFor="tts-prewarm" className="text-sm theme-text">
              Enable TTS Prewarming
            </Label>
            <Switch
              id="tts-prewarm"
              checked={ttsPrewarm}
              onCheckedChange={(value) => handleToggle("feat_tts_prewarm", value, setTtsPrewarm)}
            />
          </div>
        </div>

        <Separator />

        {/* Parallel Processing */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium theme-text">Parallel Processing</h3>
            <Badge variant="secondary" className="text-xs">Phase 1</Badge>
          </div>
          <p className="text-sm theme-text-muted">
            Run translation and TTS preparation simultaneously (~200-500ms improvement)
          </p>
          <div className="flex items-center justify-between">
            <Label htmlFor="parallel-mt-tts" className="text-sm theme-text">
              Enable Parallel MT+TTS
            </Label>
            <Switch
              id="parallel-mt-tts"
              checked={parallelMTTTS}
              onCheckedChange={(value) => handleToggle("feat_parallel_mt_tts", value, setParallelMTTTS)}
            />
          </div>
        </div>

        <Separator />

        {/* Timing Analytics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium theme-text">Timing Analytics</h3>
            <Badge variant="secondary" className="text-xs">Phase 1</Badge>
          </div>
          <p className="text-sm theme-text-muted">
            Log performance metrics for each pipeline stage (console logs only, no user impact)
          </p>
          <div className="flex items-center justify-between">
            <Label htmlFor="timing-analytics" className="text-sm theme-text">
              Enable Timing Analytics
            </Label>
            <Switch
              id="timing-analytics"
              checked={timingAnalytics}
              onCheckedChange={(value) => handleToggle("feat_timing_analytics", value, setTimingAnalytics)}
            />
          </div>
        </div>

        <Separator />

        {/* TTS Streaming */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium theme-text">TTS Streaming</h3>
            <Badge variant="outline" className="text-xs">Phase 2</Badge>
          </div>
          <p className="text-sm theme-text-muted">
            Stream audio playback as chunks arrive (~300-800ms perceived improvement)
          </p>
          <div className="flex items-center justify-between">
            <Label htmlFor="tts-streaming" className="text-sm theme-text">
              Enable TTS Streaming
            </Label>
            <Switch
              id="tts-streaming"
              checked={ttsStreaming}
              onCheckedChange={(value) => handleToggle("feat_tts_streaming", value, setTtsStreaming)}
            />
          </div>
        </div>

        <Separator />

        {/* Audio Chunking */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium theme-text">Audio Chunking</h3>
            <Badge variant="outline" className="text-xs">Phase 2</Badge>
          </div>
          <p className="text-sm theme-text-muted">
            Split long recordings into smaller chunks for faster processing
          </p>
          <div className="flex items-center justify-between">
            <Label htmlFor="audio-chunking" className="text-sm theme-text">
              Enable Audio Chunking
            </Label>
            <Switch
              id="audio-chunking"
              checked={audioChunking}
              onCheckedChange={(value) => handleToggle("feat_audio_chunking", value, setAudioChunking)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};