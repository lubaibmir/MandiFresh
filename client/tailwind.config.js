export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        forest: { DEFAULT: '#1f4a2c', light: '#2d6a40' },
        leaf: '#4c8a45',
        mist: '#f1f6ec',
        paper: '#fbfdf8',
        line: '#dde7d5',
        ink: '#17251b',
        muted: '#5f7165',
      },
    },
  },
  plugins: [],
};
