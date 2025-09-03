import { Theme } from '../types';

export const DEFAULT_THEME_ID = 'default-dark';

export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'default-dark',
    name: 'Default Dark',
    styles: {
      backgroundColor: '#1e293b', // slate-800
      titleFont: { family: 'Roboto', size: 72, weight: 'bold', style: 'normal' },
      titleColor: '#e2e8f0', // slate-200
      captionFont: { family: 'Roboto', size: 48, weight: 'normal', style: 'normal' },
      captionColor: '#cbd5e1', // slate-300
      shadowColor: 'rgba(0, 0, 0, 0.5)',
    },
  },
  {
    id: 'light-clean',
    name: 'Light & Clean',
    styles: {
      backgroundColor: '#f8fafc', // slate-50
      titleFont: { family: 'Lato', size: 72, weight: 'bold', style: 'normal' },
      titleColor: '#0f172a', // slate-900
      captionFont: { family: 'Lato', size: 48, weight: 'normal', style: 'normal' },
      captionColor: '#334155', // slate-700
      shadowColor: 'rgba(0, 0, 0, 0.2)',
    },
  },
  {
    id: 'retro-funk',
    name: 'Retro Funk',
    styles: {
      backgroundColor: '#f5d0a9',
      titleFont: { family: 'Playfair Display', size: 80, weight: 'bold', style: 'italic' },
      titleColor: '#4a2c2a',
      captionFont: { family: 'Montserrat', size: 48, weight: 'normal', style: 'normal' },
      captionColor: '#8c4843',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
    },
  },
];