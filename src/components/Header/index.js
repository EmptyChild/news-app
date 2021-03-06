import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import './index.css';
import HeaderPanel from '../HeaderPanel'

export default class Header extends Component {

  render() {
    // Formating date
    const date = new Date().toLocaleDateString();
    return (
      <header className='header'>
        <AppBar
          title={<React.Fragment><span>News App</span><span>{date}</span></React.Fragment>}
          titleStyle={{
            width: '100%',
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'}}
          iconStyleLeft={{display: 'none'}}>
        </AppBar>
        <HeaderPanel 
          submitFilterChange={this.props.submitFilterChange}
          searchDisabled={this.props.searchDisabled}
          visitorsPerDay={this.props.visitorsPerDay}/>
      </header>
    );
  }
}