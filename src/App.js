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
      articles: [],
      page: 1,
      fetchingArticles: true
    }
  }

  componentDidMount() {
    this.fetchArticles(1, (parsedRes) => {
      this.setState((prevState) => {
        return {
          articles: prevState.articles.concat(parsedRes),
          fetchingArticles: false
        };
      })
      window.onscroll = this.updateArticlesOnScroll;
    })
  }

  fetchArticles = (page, callback) => {
    return fetch(`api/get-articles/${page}`)
    .then((res) => {
      return res.json()
    })
    .then((parsedRes) => {      
      callback(parsedRes);
    });
  }
  
  updateArticlesOnScroll = () => {
    const pageHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if(scrollTop/pageHeight >= 0.8 && !this.state.fetchingArticles) {
      this.setState({
        fetchingArticles: true
      });
      this.fetchArticles(this.state.page + 1, (parsedRes) => {
        if(parsedRes.length) {
          this.setState((prevState) => {
            return {
              articles: prevState.articles.concat(parsedRes),
              page: prevState.page + 1,
              fetchingArticles: false
            };
          })
        }
      })
    }
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <Header />
          <Main 
          filter=''
          articles={this.state.articles}
          fetchingArticles={this.state.fetchingArticles}/>
          <Footer />
        </div>        
      </MuiThemeProvider>
    );
  }
}

export default App;
