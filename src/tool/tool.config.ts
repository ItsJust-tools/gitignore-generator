import type { ToolConfig } from '@itsjust/core';
import packageJson from '../../package.json';

export const templateBaseVersion = packageJson.version;

const toolConfig = {
  id: 'gitignore-generator',
  name: '.gitignore Generator',
  description:
    'Generate .gitignore files from 50+ templates — combine languages, frameworks, IDEs, and OS rules. All client-side, privacy-first.',
  version: '1.0.0',
  exportFormats: ['json', 'txt'],
  features: {
    export: true,
    autoSave: false,
    undoRedo: true,
    sidebar: true,
    statusBar: true,
    darkMode: true,
  },
  theme: {
    accent: '#e53e3e',
    accentHover: '#c53030',
    accentSubtle: 'rgba(229, 62, 62, 0.08)',
    brand: '.gitignore Generator',
    icon: '📄',
  },
  shortcuts: [
    {
      title: '.gitignore Generator',
      shortcuts: [
        { keys: 'Ctrl+Shift+C', label: 'Copy .gitignore', description: 'copy generated content to clipboard' },
        { keys: 'Ctrl+Shift+D', label: 'Download', description: 'download .gitignore as a file' },
        { keys: 'Ctrl+Shift+F', label: 'Focus search', description: 'jump to template search' },
      ],
    },
  ],
} satisfies ToolConfig;

export default toolConfig;
