import React, { Component } from 'react';
import './index.css';
import Article from '../Article';
import Spinner from '../Spinner';

export default class Main extends Component {

  render() {
    const articlesToRender = this.props.articles.map((article) => {
      return (
        <Article 
        article={article} 
        key={article._id}/>
      )
    });
    const spinner = this.props.fetchingArticles ?
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