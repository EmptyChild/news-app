import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';

export default class Header extends Component {

  render() {
    const date = new Date().toLocaleDateString();
    return (
      <header>
        <AppBar
          title={<React.Fragment><span>News App</span><span>{date}</span></React.Fragment>}
          titleStyle={{width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
          iconStyleLeft={{display: 'none'}}>
        </AppBar>
      </header>
    );
  }
}