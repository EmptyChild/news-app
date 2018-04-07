import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import './index.css';

export default class Main extends Component {

  render() {
    return (
      <main className='main'>
        <div className='wrapper'>
        <Paper zDepth={1}
          style={{width: '100%', minHeight: '600px'}}>
        </Paper>
        </div>
      </main>
    );
  }
}