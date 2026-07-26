/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cil-blue': '#1e40af',
        'cil-navy': '#0f172a',
        'cil-slate': '#64748b',
        'cil-green': '#10b981',
        'cil-orange': '#f59e0b',
        'cil-red': '#ef4444',
        marine: '#2C3E50',
        cream: '#FEF7ED',
        'cream-dark': '#F5E9D8',
        menthe: '#4ECDC4',
        corail: '#FF6B6B',
        soleil: '#FFE66D',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        brand: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
