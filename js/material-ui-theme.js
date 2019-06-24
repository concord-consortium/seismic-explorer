import { createMuiTheme } from '@material-ui/core/styles'

export default createMuiTheme({
  palette: {
    primary: {
      main: '#f8c84e',
      dark: '#f8bb31'
    },
    secondary: {
      main: '#f8c84e'
    }
  },
  typography: {
    useNextVariants: true,
    fontFamily: 'Lato, Arial, sans-serif',
    fontSize: 12.4
  },
  overrides: {
    MuiButton: {
      label: {
        textTransform: 'none',
        fontSize: 16,
        color: '#444'
      },
      root: {
        '&$disabled': {
          color: 'inherit',
          opacity: 0.5
        },
        padding: '2px 10px',
        color: '#666'
      }
    },
    PrivateSwitchBase: {
      root: {
        padding: 5,
        marginLeft: 4
      }
    },
    PrivateRadioButtonIcon: {
      root: {
        height: 21.5
      }
    }
  }
})
