import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ac37a906c2fb4071add3fdf695458724',
  appName: 'translationapp',
  webDir: 'dist',
  server: {
    url: 'https://ac37a906-c2fb-4071-add3-fdf695458724.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;