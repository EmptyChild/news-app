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
    const visitorsPerDayText = `Visitors per day: ${this.props.visitorsPerDay}`;
    return (
      <div className='wrapper'>
        <Toolbar
          style={{
            backgroundColor: 'white',
          }}>
          <ToolbarGroup
            style={{
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
          <ToolbarGroup>
            <ToolbarTitle text={visitorsPerDayText}/>
          </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }

}