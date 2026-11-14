import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'vn.id.handy.app',
  appName: 'HANDY',
  webDir: 'public',
  server: {
    url: 'https://handy.id.vn',
    cleartext: false,
    errorPath: 'error.html',
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
}

export default config
