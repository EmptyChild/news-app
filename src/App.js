import React, { Component } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import 'babel-polyfill';
import 'whatwg-fetch';
import Footer from './components/Footer';
// import MyTheme from './Theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import getMuiTheme from 'material-ui/styles/getMuiTheme';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      filteredArticles: [],
      page: 1,
      filteredPage: 1,
      fetchingArticles: true,
      filter: '',
      noMoreArticles: false,
      visitorsPerDay: 0
    }
  }

  submitFilterChange = (filterValue) => {
    if(filterValue) {
      this.setState({
        filter: filterValue,
        filteredArticles: [],
        fetchingArticles: true,
        filteredPage: 1
      });
      this.fetchArticles({page: 1, filter: filterValue}, (parsedRes) => {
        this.setState({
          filteredArticles: parsedRes.articles,
          fetchingArticles: false,
        })
      });
    } else {
      this.setState({
        filter: '',
        filteredArticles: [],
        fetchingArticles: false
      });
    }
  }

  componentDidMount() {
    this.fetchArticles({ page: 1}, (parsedRes) => {
      this.setState({
        articles: parsedRes.articles,
        filteredArticles: parsedRes,
        fetchingArticles: false,
        visitorsPerDay: parsedRes.visitorsPerDay
      })
      window.onscroll = this.updateArticlesOnScroll;
    })
  }

  fetchArticles = (options, callback) => {
    const { filter, page } = options;
    const query = filter ?
      `filter=${encodeURI(filter)}&page=${page}`
      : `page=${page}`
    return fetch(`api/get-articles?${query}`)
    .then((res) => {
      if(res.ok && res.headers.get('Content-Type') === 'application/json; charset=utf-8') {
        return res.json()
      }
      let err = new Error('Invalid Response!');
      err.resonse = res;
      throw err;
    })
    .then((parsedRes) => {      
      callback(parsedRes);
    })
    .catch((err) => {
      if(err) {
        console.error(err);
        this.setState({
          fetchingArticles: false,
          noMoreArticles: true
        })
      }
    });
  }
  
  updateArticlesOnScroll = () => {
    const pageHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    //const clientHeight = document.documentElement.clientHeight;
    if( (scrollTop/pageHeight > 0.7) && !this.state.fetchingArticles) {
      this.setState({
        fetchingArticles: true
      });
      if (this.state.page < 499) {
        console.log(this.state.page + 1);
        const page = this.state.filter ? this.state.filteredPage : this.state.page;
        this.fetchArticles({ page: page + 1, filter: this.state.filter }, (parsedRes) => {
          this.setState((prevState) => {
            if(parsedRes.articles.length) {
              if(prevState.filter) {
                return {
                  filteredArticles: prevState.filteredArticles.concat(parsedRes.articles),
                  page: prevState.filteredPage + 1,
                  fetchingArticles: false
                };
              } else {
                return {
                  articles: prevState.articles.concat(parsedRes.articles),
                  page: prevState.page + 1,
                  fetchingArticles: false
                };
              }
            } else {
              return {
                fetchingArticles: false,
                noMoreArticles: true
              }
            }
          })
        })
      } else {
        this.setState({
          fetchingArticles: false,
          noMoreArticles: true,
        })
      }
      
    }
  }

  render() {
    const articlesToRender = this.state.filter ? this.state.filteredArticles : this.state.articles;
    return (
      <MuiThemeProvider>
        <div>
          <Header 
            submitFilterChange={this.submitFilterChange}
            searchDisabled={this.state.fetchingArticles}
            visitorsPerDay={this.state.visitorsPerDay}/>
          <Main 
          articles={articlesToRender}
          fetchingArticles={this.state.fetchingArticles}
          noMoreArticles={this.state.noMoreArticles}
          filter={this.state.filter}/>
          <Footer />
        </div>        
      </MuiThemeProvider>
    );
  }
}

export default App;
