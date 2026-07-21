import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/** FormFlow palette applied to the PrimeNG Aura preset (light mode only). */
export const FormFlowPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f3f7f4',
      100: '#e3ebe5',
      200: '#c7d7cb',
      300: '#a3bda9',
      400: '#7fa38a',
      500: '#6b8f71',
      600: '#5a7a60',
      700: '#4f6d5a',
      800: '#3f5647',
      900: '#344739',
      950: '#1a261c',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#faf7f2',
          100: '#f5f1ea',
          200: '#ebe4d9',
          300: '#ddd4c6',
          400: '#c9bfb0',
          500: '#b0a593',
          600: '#8f8475',
          700: '#6f665a',
          800: '#4f4840',
          900: '#2d2d2d',
          950: '#1f1f1f',
        },
        primary: {
          color: '#6b8f71',
          contrastColor: '#ffffff',
          hoverColor: '#4f6d5a',
          activeColor: '#4f6d5a',
        },
        formField: {
          background: '#ffffff',
          disabledBackground: '#f5f1ea',
          filledBackground: '#ffffff',
          filledHoverBackground: '#ffffff',
          filledFocusBackground: '#ffffff',
          borderColor: '#d1d5db',
          hoverBorderColor: '#9ca3af',
          focusBorderColor: '#6b8f71',
          invalidBorderColor: '#c97c5d',
          color: '#2d2d2d',
          placeholderColor: '#6b7280',
          floatLabelColor: '#4f6d5a',
          floatLabelFocusColor: '#6b8f71',
          iconColor: '#4f6d5a',
        },
      },
    },
  },
});
