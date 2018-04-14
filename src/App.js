import React, { Component } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
// import MyTheme from './Theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import getMuiTheme from 'material-ui/styles/getMuiTheme';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: []
    };
  }

  componentDidMount() {
    fetch('/api/get-articles/1')
    .then((res) => {
      return res.json();
    })
    .then((parsedRes) => {
      this.setState({
        articles: parsedRes
      })
    })
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <Header />
          <Main articles={this.state.articles}/>
          <Footer />
        </div>        
      </MuiThemeProvider>
    );
  }
}

export default App;
