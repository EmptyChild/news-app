import React, { Component } from 'react';
import './index.css';
import Article from '../Article';
import Spinner from '../Spinner';

export default class Main extends Component {

  render() {
    const { articles, filter, noMoreArticles, fetchingArticles } = this.props;
    const articlesToRender = articles.map((article) => {
      return (
        <Article 
        article={article} 
        key={article._id}/>
      )
    });
    const spinner = fetchingArticles ?
    (
      <Spinner />
    ) : null;
    const noMoreArticlesMessage = noMoreArticles && !fetchingArticles ? 
    (
      <div className='main__no-more-articles-message'>
        No more Articles
      </div>
    ) : null;
    const searchResultMessage = filter ?
    (
      <div className='main__search-results-message'>
        {`Search results for "${filter}"`}
      </div>
    ) : null;
    return (
      <main className='main'>
        <div className='wrapper'>
          {searchResultMessage}
          {articlesToRender}
          {spinner}
          {noMoreArticlesMessage}          
        </div>
      </main>
    );
  }
}