module.exports = {
  prefix: '',
  purge: {
    content: ['./apps/**/*.{html,ts}', './libs/**/*.{html,ts}']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      width: {
        navBar: '232px'
      },
      height: {
        topBar: '60px',
        nowPlayingBar: '90px'
      },
      colors: {
        primary: '#1db954',
        sliderRail: '#535353',
        sliderTrack: '#b3b3b3'
      }
    }
  },
  variants: {
    extend: {
      display: ['group-hover']
    }
  },
  plugins: []
};
