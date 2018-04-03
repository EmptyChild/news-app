import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import Header from './components/Header';
// import Sidebar from './components/Sidebar';
// import Main from './components/Main';
// import MyTheme from './Theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { withRouter } from 'react-router-dom';
// import actions from './actions';


class App extends Component {

  render() {
    
    return (
      <MuiThemeProvider>
        <Header />        
      </MuiThemeProvider>
    );
  }
}

// function mapStateToProps (state) {
//   return {
//     ...state
//   }
// }

// function mapDispatchToProps(dispatch) {
//   return {
//     actions: bindActionCreators(actions, dispatch)
//   }
// }

export default withRouter(App);
