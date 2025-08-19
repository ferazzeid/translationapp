import { supabase } from "@/integrations/supabase/client";

export interface PWAManifestData {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: string;
  orientation: string;
  theme_color: string;
  background_color: string;
  categories: string[];
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose: string;
  }>;
}

export const generateDynamicManifest = async (): Promise<PWAManifestData> => {
  try {
    // Fetch admin settings for PWA configuration
    const { data: settings, error } = await supabase
      .from("admin_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["app_name", "app_short_name", "app_description", "app_icon_192", "app_icon_512"]);

    if (error) {
      console.warn("Error fetching admin settings for manifest:", error);
    }

    // Create settings map
    const settingsMap = settings?.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, string>) || {};

    // Generate manifest with admin settings or fallbacks
    const manifest: PWAManifestData = {
      name: settingsMap.app_name || "TalkDuo",
      short_name: settingsMap.app_short_name || "TalkDuo",
      description: settingsMap.app_description || "Real-time translation app for seamless communication",
      start_url: "/",
      display: "standalone",
      orientation: "portrait",
      theme_color: "#1a1a2e",
      background_color: "#0f0f23",
      categories: ["productivity", "utilities"],
      icons: [
        {
          src: settingsMap.app_icon_192 || "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: settingsMap.app_icon_512 || "/icon-512.png", 
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    };

    return manifest;
  } catch (error) {
    console.error("Error generating dynamic manifest:", error);
    
    // Return default manifest on error
    return {
      name: "TalkDuo",
      short_name: "TalkDuo",
      description: "Real-time translation app for seamless communication",
      start_url: "/",
      display: "standalone", 
      orientation: "portrait",
      theme_color: "#1a1a2e",
      background_color: "#0f0f23",
      categories: ["productivity", "utilities"],
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192", 
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png", 
          purpose: "any maskable"
        }
      ]
    };
  }
};

export const updateFaviconLinks = async () => {
  try {
    // Fetch admin settings for favicon
    const { data: settings, error } = await supabase
      .from("admin_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["app_icon_192", "app_icon_512", "favicon_url", "app_logo_url"]);

    if (error) {
      console.warn("Error fetching favicon settings:", error);
      return;
    }

    const settingsMap = settings?.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, string>) || {};

    // Update favicon links with aggressive cache busting
    const favicon192 = settingsMap.app_icon_192 || settingsMap.favicon_url || settingsMap.app_logo_url || "/icon-192.png";
    const favicon512 = settingsMap.app_icon_512 || settingsMap.favicon_url || settingsMap.app_logo_url || "/icon-512.png";
    const timestamp = Date.now();

    // Remove ALL existing favicon and icon links to avoid conflicts
    const existingIcons = document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]');
    existingIcons.forEach(link => link.remove());

    // Add primary favicon (browser tab)
    const primaryFavicon = document.createElement('link');
    primaryFavicon.rel = 'icon';
    primaryFavicon.type = 'image/png';
    primaryFavicon.href = `${favicon192}?v=${timestamp}`;
    document.head.appendChild(primaryFavicon);

    // Add 192x192 icon
    const favicon192Link = document.createElement('link');
    favicon192Link.rel = 'icon';
    favicon192Link.type = 'image/png';
    favicon192Link.setAttribute('sizes', '192x192');
    favicon192Link.href = `${favicon192}?v=${timestamp}`;
    document.head.appendChild(favicon192Link);

    // Add 512x512 icon
    const favicon512Link = document.createElement('link');
    favicon512Link.rel = 'icon';
    favicon512Link.type = 'image/png';
    favicon512Link.setAttribute('sizes', '512x512');
    favicon512Link.href = `${favicon512}?v=${timestamp}`;
    document.head.appendChild(favicon512Link);

    // Update apple touch icon with cache busting
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = `${favicon192}?v=${timestamp}`;
    document.head.appendChild(appleTouchIcon);

    // Force browser to refresh icon cache
    const tempLink = document.createElement('link');
    tempLink.rel = 'shortcut icon';
    tempLink.href = `${favicon192}?refresh=${timestamp}`;
    document.head.appendChild(tempLink);
    
    // Remove the temp link after a moment
    setTimeout(() => {
      if (tempLink.parentNode) {
        tempLink.parentNode.removeChild(tempLink);
      }
    }, 100);

    console.log("Favicon links updated successfully with cache busting");
  } catch (error) {
    console.error("Error updating favicon links:", error);
  }
};