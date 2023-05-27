module.exports = {
  prefix: '',
  mode: process.env.TAILWIND_MODE ? 'jit' : '',
  purge: {
    content: ['./apps/**/*.{html,ts}', './libs/**/*.{html,ts}']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      width: {
        navBar: '280px'
      },
      height: {
        topBar: '60px',
        nowPlayingBar: '72px'
      },
      colors: {
        primary: 'rgb(var(--text-primary) / <alpha-value>)',
        sliderRail: '#535353',
        sliderTrack: '#b3b3b3',
        baseline: 'rgb(var(--background-baseline) / <alpha-value>)',
        white: 'rgb(var(--text-baseline) / <alpha-value>)',
        highlight: 'rgb(var(--background-highlight) / <alpha-value>)',
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
