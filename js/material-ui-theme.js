import { createMuiTheme } from '@material-ui/core/styles'

export default createMuiTheme({
  palette: {
    primary: {
      main: '#f8c84e'
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
      root: {
        '&:hover': {
          backgroundColor: '#f2f2f2',
        },
        '&$disabled': {
          color: 'inherit',
          opacity: 0.25
        }
      },
      text: {
        color: '#666',
        padding: 0
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
