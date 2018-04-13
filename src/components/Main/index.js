import React, { Component } from 'react';
import './index.css';
import Article from '../Article'

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: this.props.articles,
      page: 1,
      fetchingArticles: false
    }
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

  componentDidMount() {
    
    window.onscroll = this.updateArticlesOnScroll;
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
      <div className='spinner-container'>
        <span>Loading...</span>
        <div className='donut'></div>
      </div>
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