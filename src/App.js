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
      filteredArticles: [],
      page: 1,
      fetchingArticles: true,
      filter: '',
      noMoreArticles: false
    }
  }

  fetchArticlesUntillEnoughToRender = (filterValue, page, filteredArticles) => {
    console.log(page)
    if(filteredArticles.length < 10 && (filterValue === this.state.filter || page < 5) ) {
      
      const nextPage = page + 1;
      this.fetchArticles({page: nextPage, filter: filterValue}, (parsedRes) => {
        const newFilteredArticles = filteredArticles.concat(parsedRes);
        this.fetchArticlesUntillEnoughToRender(filterValue, nextPage, newFilteredArticles);
      })
    } else {
      this.setState({
        filteredArticles,
        fetchingArticles: false,
        noMoreArticles: page > 499 ? true : false,
        page
      })
    }
  }

  submitFilterChange = (filterValue) => {
    if(filterValue) {
      this.setState({
        filter: filterValue,
        filteredArticles: [],
        fetchingArticles: true
      });
      this.fetchArticlesUntillEnoughToRender(filterValue, 1, []);
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
        articles: parsedRes,
        filteredArticles: parsedRes,
        fetchingArticles: false
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
    const clientHeight = document.documentElement.clientHeight;
    if( ((pageHeight - scrollTop) < (0,3 * clientHeight)) && !this.state.fetchingArticles) {
      console.log(this.state.page + 1)
      this.setState({
        fetchingArticles: true
      });
      if (this.state.page < 499) {
        this.fetchArticles({ page: this.state.page + 1, filter: this.state.filter }, (parsedRes) => {
          this.setState((prevState) => {
            if(prevState.filter) {
              return {
                filteredArticles: parsedRes,
                page: prevState.page + 1,
                fetchingArticles: false
              };
            } else {
              return {
                articles: parsedRes,
                page: prevState.page + 1,
                fetchingArticles: false
              };
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
            searchDisabled={this.state.fetchingArticles}/>
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
