// Used to make sure tailwindcss-intellisense plugin works for vscode
// https://github.com/tailwindlabs/tailwindcss-intellisense/issues/567#issuecomment-1459547251
try {
  require('../../.pnp.cjs').setup(); // gross but it works. don't fuck with it
} catch {
  // Nada
}

import tailwindTypography from '@tailwindcss/typography';
import daisyUi from 'daisyui';
import daisyThemes from 'daisyui/src/theming/themes';
import {fontFamily} from 'tailwindcss/defaultTheme';

import tailwindSafeArea from './tailwind-plugins/safeArea.js';
import tailwindScrollbarHide from './tailwind-plugins/scrollbarHide.js';

export default {
  future: {
    hoverOnlyWhenSupported: true,
  },
  darkMode: 'class',
  content: ['node_modules/daisyui/**/*.{js,jsx}', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: {
        standalone: {raw: '(display-mode: standalone)'},
        desktop: '868px',
      },
      fontFamily: {
        sans: ['Poppins', ...fontFamily.sans],
        mono: ['Source Code Pro', ...fontFamily.mono],
      },
      fontSize: {
        xxs: '0.66rem' /* 12px */,
      },
      transitionProperty: {
        height: 'height',
        width: 'width',
      },
      animation: {
        'bounce-small': 'bounceSmall 1s infinite',
      },
      keyframes: {
        bounceSmall: {
          '0%, 100%': {
            transform: 'translateY(-6%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
    },
  },
  daisyui: {
    logs: false, // ¯\_(ツ)_/¯
    themes: [
      {
        light: {
          ...daisyThemes['[data-theme=light]'],
          'color-scheme': 'light',
          // fontFamily:
          //   'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace',
          '.text-brand': {
            color: '#dc2626',
          },
          '.background-brand': {
            'background-color': '#dc2626',
          },
          '.border-brand': {
            'border-color': '#dc2626',
          },
          '.background': {
            'background-color': '#f3f3f3',
          },
          primary: '#dc2626',
          'primary-content': '#ffffff',
          secondary: '#000',
          'secondary-content': '#ffffff',
          accent: '#dc2626',
          'accent-content': '#fee2e2',
          neutral: '#525252',
          'neutral-focus': '#404040',
          'neutral-content': '#fafafa',
          'base-100': '#ffffff',
          'base-200': '#eaeaea',
          'base-300': '#999',
          'base-content': '#1f2937',
          info: '#e0f2fe',
          'info-content': '#0284c7',
          success: '#D1F5E5',
          'success-content': '#36A071',
          warning: '#FBF5DF',
          'warning-content': '#907D47',
          error: '#F5DBE1',
          'error-content': '#A25364',
          '--rounded-box': '0',
          '--rounded-btn': '0',
          '--rounded-badge': '0',
          '--tab-radius': '0',
        },
      },
      {
        dark: {
          ...daisyThemes['[data-theme=dark]'],
          'color-scheme': 'dark',
          // fontFamily:
          //   'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace',
          '.text-brand': {
            color: '#dc2626',
          },
          '.background-brand': {
            'background-color': '#dc2626',
          },
          '.border-brand': {
            'border-color': '#dc2626',
          },
          primary: '#dc2626',
          'primary-content': '#ffffff',
          secondary: '#000',
          accent: '#dc2626',
          'accent-content': '#fee2e2',
          neutral: '#525252',
          'neutral-focus': '#404040',
          'neutral-content': '#fafafa',
          'base-100': '#444',
          'base-200': '#333',
          'base-300': '#111',
          'base-content': '#fafafa',
          info: '#3D4677',
          // 'info-focus': '#A4B1F6',
          'info-content': '#7D8FF2',
          success: '#23684A',
          'success-content': '#48D597',
          warning: '#746539',
          'warning-content': '#EFD176',
          error: '#6C3743',
          'error-content': '#D86F86',
          '--rounded-box': '0',
          '--rounded-btn': '0',
          '--rounded-badge': '0',
          '--tab-radius': '0',
        },
      },
    ],
  },
  plugins: [tailwindTypography, tailwindScrollbarHide, tailwindSafeArea, daisyUi],
};
