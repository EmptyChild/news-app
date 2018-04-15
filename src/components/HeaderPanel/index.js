import React, { Component } from 'react';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

export default class HeaderPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterValue: ''
    }
  }

  handleFilterInputChange = (evt) => {
    this.setState({
      filterValue: evt.target.value
    })
  }

  handleSearchClick = () => {
    this.props.submitFilterChange(this.state.filterValue);
  }

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
          <TextField
            type='search' 
            hintText='Input keywords to filter articles'
            onChange={this.handleFilterInputChange} />
          <RaisedButton
            label='SEARCH'
            onClick={this.handleSearchClick}/>
        </ToolbarGroup>
      </Toolbar>
    );
  }

}