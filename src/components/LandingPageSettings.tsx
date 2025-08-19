import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LandingPageData {
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  feature_1_title: string;
  feature_1_description: string;
  feature_2_title: string;
  feature_2_description: string;
  feature_3_title: string;
  feature_3_description: string;
  app_name: string;
  google_play_url: string;
  google_analytics_id: string;
  meta_description: string;
  meta_keywords: string;
}

export const LandingPageSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<LandingPageData>({
    hero_title: "",
    hero_subtitle: "",
    hero_cta_text: "",
    feature_1_title: "",
    feature_1_description: "",
    feature_2_title: "",
    feature_2_description: "",
    feature_3_title: "",
    feature_3_description: "",
    app_name: "",
    google_play_url: "",
    google_analytics_id: "",
    meta_description: "",
    meta_keywords: "",
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'hero_title', 'hero_subtitle', 'hero_cta_text',
          'feature_1_title', 'feature_1_description',
          'feature_2_title', 'feature_2_description', 
          'feature_3_title', 'feature_3_description',
          'app_name', 'google_play_url', 'google_analytics_id',
          'meta_description', 'meta_keywords'
        ]);

      if (error) throw error;

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.setting_key] = item.setting_value || "";
          return acc;
        }, {} as Record<string, string>);

        setSettings({
          hero_title: settingsMap.hero_title || "One Device Two People",
          hero_subtitle: settingsMap.hero_subtitle || "AI-powered real-time translation designed for one-on-one conversations. Reliable, accurate, and simple enough for anyone to use together.",
          hero_cta_text: settingsMap.hero_cta_text || "Get it on Google Play",
          feature_1_title: settingsMap.feature_1_title || "Any Language",
          feature_1_description: settingsMap.feature_1_description || "Real-time translation across 100+ languages with AI-powered accuracy. No language barriers.",
          feature_2_title: settingsMap.feature_2_title || "One-on-One Conversations",
          feature_2_description: settingsMap.feature_2_description || "Two people, one device. Share the screen and have natural conversations with instant translation.",
          feature_3_title: settingsMap.feature_3_title || "Managed Mode",
          feature_3_description: settingsMap.feature_3_description || "Perfect for non-tech-savvy users. The app guides the conversation flow, making it reliable and easy to use together.",
          app_name: settingsMap.app_name || "TalkDuo",
          google_play_url: settingsMap.google_play_url || "https://play.google.com/store/apps/details?id=com.talkduo.app",
          google_analytics_id: settingsMap.google_analytics_id || "",
          meta_description: settingsMap.meta_description || "AI-powered real-time translation designed for one-on-one conversations. Two people, one device. Reliable, accurate, and simple enough for anyone to use together.",
          meta_keywords: settingsMap.meta_keywords || "translation app, real-time translation, voice translation, one-on-one conversation, AI translation, managed conversation",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to load settings: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each setting individually
      const promises = Object.entries(settings).map(([key, value]) =>
        supabase.rpc('set_admin_setting', {
          key_name: key,
          value: value,
          encrypted: false
        })
      );

      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to save ${errors.length} settings`);
      }

      toast({
        title: "Success",
        description: "Landing page settings saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save settings: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof LandingPageData, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold theme-text">Landing Page Content</h2>
          <p className="text-sm theme-text-muted">Customize the content shown on your landing page</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="theme-button">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* App Branding */}
        <Card className="theme-surface theme-border">
          <CardHeader>
            <CardTitle className="theme-text">App Branding</CardTitle>
            <CardDescription className="theme-text-muted">
              Configure your app's branding and external links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="app_name" className="theme-text">App Name</Label>
              <Input
                id="app_name"
                value={settings.app_name}
                onChange={(e) => updateSetting('app_name', e.target.value)}
                placeholder="Your App Name"
                className="theme-input"
              />
            </div>
            <div>
              <Label htmlFor="google_play_url" className="theme-text">Google Play Store URL</Label>
              <Input
                id="google_play_url"
                value={settings.google_play_url}
                onChange={(e) => updateSetting('google_play_url', e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=..."
                className="theme-input"
              />
            </div>
            <div>
              <Label htmlFor="google_analytics_id" className="theme-text">Google Analytics ID</Label>
              <Input
                id="google_analytics_id"
                value={settings.google_analytics_id}
                onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="theme-input"
              />
              <p className="text-xs theme-text-muted mt-1">
                Enter your Google Analytics 4 measurement ID (starts with G-)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card className="theme-surface theme-border">
          <CardHeader>
            <CardTitle className="theme-text">SEO Settings</CardTitle>
            <CardDescription className="theme-text-muted">
              Configure meta tags and SEO information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="meta_description" className="theme-text">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={settings.meta_description}
                onChange={(e) => updateSetting('meta_description', e.target.value)}
                placeholder="Describe your app in 150-160 characters for search engines..."
                className="theme-input"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs theme-text-muted mt-1">
                {settings.meta_description.length}/160 characters
              </p>
            </div>
            <div>
              <Label htmlFor="meta_keywords" className="theme-text">Meta Keywords</Label>
              <Input
                id="meta_keywords"
                value={settings.meta_keywords}
                onChange={(e) => updateSetting('meta_keywords', e.target.value)}
                placeholder="keyword1, keyword2, keyword3..."
                className="theme-input"
              />
              <p className="text-xs theme-text-muted mt-1">
                Comma-separated keywords relevant to your app
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hero Section */}
        <Card className="theme-surface theme-border">
          <CardHeader>
            <CardTitle className="theme-text">Hero Section</CardTitle>
            <CardDescription className="theme-text-muted">
              The main banner that visitors see first
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hero_title" className="theme-text">Hero Title</Label>
              <Input
                id="hero_title"
                value={settings.hero_title}
                onChange={(e) => updateSetting('hero_title', e.target.value)}
                placeholder="Your Amazing App"
                className="theme-input"
              />
            </div>
            <div>
              <Label htmlFor="hero_subtitle" className="theme-text">Hero Subtitle</Label>
              <Textarea
                id="hero_subtitle"
                value={settings.hero_subtitle}
                onChange={(e) => updateSetting('hero_subtitle', e.target.value)}
                placeholder="Describe what makes your app special..."
                className="theme-input"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="hero_cta_text" className="theme-text">Call-to-Action Button Text</Label>
              <Input
                id="hero_cta_text"
                value={settings.hero_cta_text}
                onChange={(e) => updateSetting('hero_cta_text', e.target.value)}
                placeholder="Try Web App"
                className="theme-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card className="theme-surface theme-border">
          <CardHeader>
            <CardTitle className="theme-text">Features Section</CardTitle>
            <CardDescription className="theme-text-muted">
              Highlight your app's key features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Feature 1 */}
            <div className="space-y-2">
              <h4 className="font-medium theme-text">Feature 1</h4>
              <div className="space-y-2">
                <Input
                  value={settings.feature_1_title}
                  onChange={(e) => updateSetting('feature_1_title', e.target.value)}
                  placeholder="Feature title"
                  className="theme-input"
                />
                <Textarea
                  value={settings.feature_1_description}
                  onChange={(e) => updateSetting('feature_1_description', e.target.value)}
                  placeholder="Feature description"
                  className="theme-input"
                  rows={2}
                />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="space-y-2">
              <h4 className="font-medium theme-text">Feature 2</h4>
              <div className="space-y-2">
                <Input
                  value={settings.feature_2_title}
                  onChange={(e) => updateSetting('feature_2_title', e.target.value)}
                  placeholder="Feature title"
                  className="theme-input"
                />
                <Textarea
                  value={settings.feature_2_description}
                  onChange={(e) => updateSetting('feature_2_description', e.target.value)}
                  placeholder="Feature description"
                  className="theme-input"
                  rows={2}
                />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="space-y-2">
              <h4 className="font-medium theme-text">Feature 3</h4>
              <div className="space-y-2">
                <Input
                  value={settings.feature_3_title}
                  onChange={(e) => updateSetting('feature_3_title', e.target.value)}
                  placeholder="Feature title"
                  className="theme-input"
                />
                <Textarea
                  value={settings.feature_3_description}
                  onChange={(e) => updateSetting('feature_3_description', e.target.value)}
                  placeholder="Feature description"
                  className="theme-input"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};