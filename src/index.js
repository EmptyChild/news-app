import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import 'react-hot-loader/patch'
import 'babel-polyfill';
import 'webpack-hot-middleware/client';
import App from './App';
import './index.css'
// import { Provider } from 'react-redux';
import {BrowserRouter as Router}  from 'react-router-dom';
import { AppContainer } from 'react-hot-loader';
// import configureStore from './store/configureStore';

// let initialState;

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Router>
        <Component />
      </Router>
    </AppContainer>,
  document.getElementById('root')
  )
}
// const username = window.location.pathname.split('/')[2];
// const xhr = new XMLHttpRequest();
// xhr.open('GET', `/api/users/${username}`, true);
// xhr.send();
// xhr.onreadystatechange = function () {
//   if (this.readyState !== 4) {
//     return;
//   }
//   if (this.status !== 200) {
//     return;
//   }
  
//   render(App);
  
// };

render(App);

if (module.hot) {
  module.hot.accept('./App', () => {
    render(App)
  })
}