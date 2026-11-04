import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.carottejy.sewingcompanion',
  appName: 'Sewing Companion',
  webDir: 'dist',
  android: { backgroundColor: '#f5efe4' },
  plugins: {
    SystemBars: { insetsHandling: 'css', style: 'LIGHT' },
  },
}

export default config
