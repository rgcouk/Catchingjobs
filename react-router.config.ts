import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';
export default {
  appDirectory: 'apps/web/src',
  buildDirectory: 'dist',
  ssr: true,
  prerender: ['/', '/corporate', '/training/moffett', '/chickens', '/turkeys'],
  presets: [vercelPreset()],
} satisfies Config;
