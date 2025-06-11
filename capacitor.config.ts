
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9786d6ffca384776b2f4cfa5089dfdb7',
  appName: 'pothole-alert-id',
  webDir: 'dist',
  server: {
    url: "https://9786d6ff-ca38-4776-b2f4-cfa5089dfdb7.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
