/** @type {import('tailwindcss').Config} */
module.exports = {
  // Desabilitar dark mode - sempre usar tema claro
  darkMode: 'class', // Só ativa se tiver class="dark" no HTML (nunca terá)
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

