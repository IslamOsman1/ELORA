export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: { 50: '#fff9eb', 100: '#f8e7bd', 300: '#d8b66a', 500: '#b9944e', 700: '#74542a' },
        ink: '#090908'
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['Manrope', 'sans-serif']
      }
    }
  },
  plugins: []
};
