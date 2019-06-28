import { createMuiTheme } from '@material-ui/core/styles'

export default createMuiTheme({
  palette: {
    primary: {
      main: '#ffffff',
      dark: '#f4f4f4'
    },
    secondary: {
      main: '#f8c84e',
      dark: '#f8bb31'
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
        padding: '2px 10px'
      },
      containedPrimary: {
        '&$disabled': {
          backgroundColor: '#ffffff',
          opacity: 0.5
        }
      },
      containedSecondary: {
        '&$disabled': {
          backgroundColor: '#f8c84e',
          opacity: 0.5
        }
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
