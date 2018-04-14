import React, { Component } from 'react';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

export default class Main extends Component {

  render() {
    return (
      <Toolbar
        style={{
          backgroundColor: 'white'
        }}>
        <ToolbarGroup
          style={{
            width: '100%',
            maxWidth: '1200px', 
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'start'
          }}>
          <ToolbarTitle text='Filter' />
          <TextField hintText='Input keywords to filter articles' />
          <RaisedButton label='SEARCH'/>
        </ToolbarGroup>
      </Toolbar>
    );
  }

}