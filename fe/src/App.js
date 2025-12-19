import './App.css';
import Home from "./Components/Home"

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme = {theme}>
      <div className="App">
        <Home/>
      </div>
    </ThemeProvider>
  );
}

export default App;
