module.exports = {
  prefix: '',
  purge: {
    content: ['./apps/**/*.{html,ts}', './libs/**/*.{html,ts}']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      width: {
        navBar: '232px',
        topBar: '60px'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
