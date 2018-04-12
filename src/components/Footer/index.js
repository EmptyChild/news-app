import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import './index.css';

export default class Header extends Component {

  render() {
    return (
      <footer>
        <AppBar
          title={
            <React.Fragment>
              <span className='b-footer__link-headling'>Contact us:</span>  
              <a href='mailto:nikkita1992@mail.ru'>nikkita1992@mail.ru</a>
            </React.Fragment>
          }
          titleStyle={{
            width: '100%',
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center'}}
          iconStyleLeft={{display: 'none'}}>
        </AppBar>
      </footer>
    );
  }
}