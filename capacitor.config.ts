import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.talkduo.conversation',
  appName: 'TalkDuo',
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