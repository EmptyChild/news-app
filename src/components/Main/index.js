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
    // if we already rendered some articles, not fetching them right not and noMoreArticle is true,
    // show message that no more articles found at the end of articles list
    const noMoreArticlesMessage = articles.length && noMoreArticles && !fetchingArticles ? 
    (
      <div className='main__no-more-articles-message'>
        No more Articles found
      </div>
    ) : null;
    // if we not fetching articles right now, there is a filter applied and we have some articles to render, 
    // show message that it is search result for filter
    const searchResultMessage = fetchingArticles ?
      null
      : !filter ?
      null 
      : articles.length ?
      ( 
        <div className='main__search-results-message'>
          {`Search results for "${filter}"`}
        </div>
      )
      // if we not fetching, there is a filter and no articles to render,
      // show message that no search results for our filter
      : ( 
        <div className='main__search-results-message'>
          {` No search results for "${filter}"`}
        </div>
      );
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