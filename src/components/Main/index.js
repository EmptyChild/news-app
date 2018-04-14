import React, { Component } from 'react';
import './index.css';
import Article from '../Article';
import Spinner from '../Spinner';

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      page: 1,
      fetchingArticles: true
    }
  }

  componentDidMount() {
    fetch('/api/get-articles/1')
    .then((res) => {
      return res.json();
    })
    .then((parsedRes) => {
      this.setState({
        articles: parsedRes,
        fetchingArticles: false
      })
      window.onscroll = this.updateArticlesOnScroll;
    })
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
      fetch(`api/get-articles/${this.state.page + 1}`)
      .then((res) => {
        return res.json()
      })
      .then((parsedRes) => {
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
    const articlesToRender = this.state.articles.map((article) => {
      return (
        <Article 
        article={article} 
        key={article._id}/>
      )
    });
    const spinner = this.state.fetchingArticles ?
    (
      <Spinner />
    ) : null;
    return (
      <main className='main'>
        <div className='wrapper'>
          {articlesToRender}
          {spinner}          
        </div>
      </main>
    );
  }
}