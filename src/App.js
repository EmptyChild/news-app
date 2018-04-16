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

  fetchArticlesUntillEnoughToRender = (filterValue, page, articles, filteredArticles) => {
    console.log(page)
    if(filteredArticles.length < 10 && page <= 499 && filterValue === this.state.filter) {
      
      const nextPage = page + 1;
      this.fetchArticles({page: nextPage}, (parsedRes) => {
        const newArticles = articles.concat(parsedRes);
        const newFilteredArticles = newArticles.filter((article) => {
          return article.title.toLowerCase().includes(filterValue) || article.description.toLowerCase().includes(filterValue);
        });
        this.fetchArticlesUntillEnoughToRender(filterValue, nextPage, newArticles, newFilteredArticles);
      })
    } else {
      this.setState({
        articles: articles,
        filteredArticles: filteredArticles,
        fetchingArticles: false,
        noMoreArticles: page > 499 ? true : false,
        page
      })
    }
  }

  submitFilterChange = (filterValue) => {
    this.setState({
      filter: filterValue.toLowerCase(),
      filteredArticles: [],
      fetchingArticles: true
    });
  
    let filteredArticles = this.state.articles.filter((article) => {
      return article.title.toLowerCase().includes(filterValue) || article.description.toLowerCase().includes(filterValue);
    });
    this.fetchArticlesUntillEnoughToRender(filterValue.toLowerCase(), this.state.page, this.state.articles, filteredArticles);
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
      `filter=${filter}&page=${page}`
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
            const newArticles = prevState.articles.concat(parsedRes);
            const newFilteredArticles = prevState.filteredArticles.concat(parsedRes.filter((article) => {
              return article.title.includes(prevState.filter) || article.description.includes(prevState.filter);
            }));
            return {
              articles: newArticles,
              filteredArticles: newFilteredArticles,
              page: prevState.page + 1,
              fetchingArticles: false
            };
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
    return (
      <MuiThemeProvider>
        <div>
          <Header 
            submitFilterChange={this.submitFilterChange}
            searchDisabled={this.state.fetchingArticles}/>
          <Main 
          articles={this.state.filter ? this.state.filteredArticles : this.state.articles}
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
