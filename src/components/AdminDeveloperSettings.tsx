import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sttServiceFactory } from "@/services/stt/STTServiceFactory";
import { STTProvider } from "@/types/stt";

export const AdminDeveloperSettings = () => {
  const [sttProvider, setSttProvider] = useState<STTProvider>('openai');
  const [fallbackProvider, setFallbackProvider] = useState<STTProvider>('openai');
  const [timeout, setTimeout] = useState('60000');
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const [googleCloudKey, setGoogleCloudKey] = useState('');
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [streamingSupported, setStreamingSupported] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    loadCurrentProviderInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'stt_provider',
          'stt_fallback_provider', 
          'stt_timeout',
          'stt_telemetry_enabled',
          'stt_developer_mode',
          'google_cloud_service_account_key'
        ]);

      if (settings) {
        settings.forEach(setting => {
          switch (setting.setting_key) {
            case 'stt_provider':
              setSttProvider(setting.setting_value as STTProvider);
              break;
            case 'stt_fallback_provider':
              setFallbackProvider(setting.setting_value as STTProvider);
              break;
            case 'stt_timeout':
              setTimeout(setting.setting_value);
              break;
            case 'stt_telemetry_enabled':
              setTelemetryEnabled(setting.setting_value === 'true');
              break;
            case 'stt_developer_mode':
              setDeveloperMode(setting.setting_value === 'true');
              break;
            case 'google_cloud_service_account_key':
              setGoogleCloudKey(setting.setting_value || '');
              break;
          }
        });
      }
    } catch (error) {
      console.error('Failed to load STT settings:', error);
      toast.error('Failed to load STT settings');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentProviderInfo = async () => {
    try {
      const provider = await sttServiceFactory.getSTTProvider();
      setCurrentProvider(provider.getProviderName());
      setStreamingSupported(provider.isStreamingSupported());
    } catch (error) {
      console.error('Failed to load current provider info:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);

      const updates = [
        { key: 'stt_provider', value: sttProvider },
        { key: 'stt_fallback_provider', value: fallbackProvider },
        { key: 'stt_timeout', value: timeout },
        { key: 'stt_telemetry_enabled', value: telemetryEnabled.toString() },
        { key: 'stt_developer_mode', value: developerMode.toString() }
      ];

      for (const update of updates) {
        const { error } = await supabase.rpc('set_admin_setting', {
          key_name: update.key,
          value: update.value,
          encrypted: false
        });

        if (error) throw error;
      }

      // Save Google Cloud service account key separately (encrypted)
      if (googleCloudKey.trim()) {
        const { error: keyError } = await supabase.rpc('set_admin_setting', {
          key_name: 'google_cloud_service_account_key',
          value: googleCloudKey,
          encrypted: true
        });

        if (keyError) throw keyError;
      }

      // Force reload of STT service factory
      await sttServiceFactory.getSTTProvider(true);
      await loadCurrentProviderInfo();

      toast.success('STT settings saved successfully');
    } catch (error) {
      console.error('Failed to save STT settings:', error);
      toast.error('Failed to save STT settings');
    } finally {
      setLoading(false);
    }
  };

  const testProvider = async () => {
    try {
      setLoading(true);
      toast.info('Testing STT provider...');

      // Test with mock audio data
      const provider = await sttServiceFactory.getSTTProvider();
      const testResult = await provider.transcribe('mock_audio_data', 'en');
      
      if (testResult.success) {
        toast.success(`✅ ${provider.getProviderName()} provider working`);
      } else {
        toast.error(`❌ ${provider.getProviderName()} provider failed: ${testResult.error}`);
      }
    } catch (error) {
      console.error('Provider test failed:', error);
      toast.error('Provider test failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentProvider) {
    return <div>Loading STT settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Speech-to-Text Developer Settings
          <Badge variant={streamingSupported ? "default" : "secondary"}>
            {streamingSupported ? "Streaming" : "Batch"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Configure STT providers and testing options. Current active provider: <strong>{currentProvider}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stt-provider">Primary STT Provider</Label>
              <Select value={sttProvider} onValueChange={(value: STTProvider) => setSttProvider(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select STT provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI Whisper (Batch)</SelectItem>
                  <SelectItem value="google_streaming">Google Cloud STT (Streaming)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fallback-provider">Fallback Provider</Label>
              <Select value={fallbackProvider} onValueChange={(value: STTProvider) => setFallbackProvider(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fallback provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI Whisper</SelectItem>
                  <SelectItem value="google_streaming">Google Cloud STT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout">Streaming Timeout (ms)</Label>
            <Input
              id="timeout"
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
              placeholder="60000"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="telemetry">Performance Telemetry</Label>
                <p className="text-sm text-muted-foreground">
                  Log STT performance metrics for analysis
                </p>
              </div>
              <Switch
                id="telemetry"
                checked={telemetryEnabled}
                onCheckedChange={setTelemetryEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dev-mode">Developer Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable additional debugging and testing features
                </p>
              </div>
              <Switch
                id="dev-mode"
                checked={developerMode}
                onCheckedChange={setDeveloperMode}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Google Cloud Configuration</h3>
          <div className="space-y-2">
            <Label htmlFor="google-cloud-key">Service Account Key (JSON)</Label>
            <textarea
              id="google-cloud-key"
              className="w-full h-32 p-3 text-sm border rounded-md resize-none font-mono"
              placeholder="Paste your Google Cloud service account JSON key here..."
              value={googleCloudKey}
              onChange={(e) => setGoogleCloudKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This key will be encrypted and stored securely. Required for Google Cloud Speech-to-Text streaming.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button variant="outline" onClick={testProvider} disabled={loading}>
            Test Provider
          </Button>
          <Button variant="outline" onClick={loadCurrentProviderInfo} disabled={loading}>
            Refresh Status
          </Button>
        </div>

        {developerMode && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Developer Information</h4>
            <div className="text-sm space-y-1">
              <p><strong>Active Provider:</strong> {currentProvider}</p>
              <p><strong>Streaming Support:</strong> {streamingSupported ? 'Yes' : 'No'}</p>
              <p><strong>Timeout:</strong> {timeout}ms</p>
              <p><strong>Telemetry:</strong> {telemetryEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};