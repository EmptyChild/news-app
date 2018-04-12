import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
// import MyTheme from './Theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { withRouter } from 'react-router-dom';
// import actions from './actions';


class App extends Component {

  render() {
    
    return (
      <MuiThemeProvider>
        <div>
          <Header />
          <Main />
          <Footer />
        </div>        
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
