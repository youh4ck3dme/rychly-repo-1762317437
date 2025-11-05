import colors from 'tailwindcss/colors';
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // Include Astro, HTML, and other file types for Tailwind classes
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map 'primary' to Tailwind's indigo palette and add secondary
        primary: colors.indigo,
        secondary: colors.gray,
        // Custom brand colors
        brand: {
          // FONT QUALITY: Per user request, primary text is set to 95% opacity to reduce eye strain and improve visual comfort.
          'primary': 'rgba(255, 255, 255, 0.95)',
          'secondary': '#CCCCCC',
          'background': '#000000',
        },
      },
      fontFamily: {
        // FONT OVERRIDE: Per user request, the entire application must use the Apple system font stack.
        // Do not add other fonts (e.g., serif, display) to this configuration.
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'pulse-glow': 'pulse-glow 2.5s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    }
  },
  plugins: [],
}