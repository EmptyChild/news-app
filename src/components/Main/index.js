import React, { Component } from 'react';
import './index.css';
import Article from '../Article'

export default class Main extends Component {

  render() {
    return (
      <main className='main'>
        <div className='wrapper'>
          <Article />
        </div>
      </main>
    );
  }
}