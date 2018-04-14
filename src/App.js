import React, { Component } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
// import MyTheme from './Theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import getMuiTheme from 'material-ui/styles/getMuiTheme';


class App extends Component {

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <Header />
          <Main />
          <Footer />
        </div>        
      </MuiThemeProvider>
    );
  }
}

export default App;
