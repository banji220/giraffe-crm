import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        giraffe: {
          blue: '#1E3A8A',
          gold: '#F59E0B',
        },
        pin: {
          unknocked: '#9CA3AF',   // grey
          cold: '#93C5FD',        // light blue
          working: '#FCD34D',     // yellow
          customer: '#34D399',    // green
          dead: '#4B5563',        // dark grey
          avoid: '#EF4444',       // red
        },
      },
    },
  },
  plugins: [],
}
export default config
