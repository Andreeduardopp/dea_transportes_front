/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul Escuro
        'azul': {
          950: '#020617',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#3B82F6',
          400: '#60A5FA',
        },
        // Cinza
        'cinza': {
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        // Feedback
        'erro': '#EF4444',
        'erro-suave': '#FEE2E2',
        'sucesso': '#22C55E',
        'sucesso-suave': '#DCFCE7',
        'aviso': '#F59E0B',
        'aviso-suave': '#FEF3C7',
        // Cores personalizadas para o tema de logística/transportes
        'azul-logistica': '#1e3a8a',
        'cinza-asfalto': '#334155',
        'verde-sucesso': '#10b981',
      }
    },
  },
  plugins: [],
}