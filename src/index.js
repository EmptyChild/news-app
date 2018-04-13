import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import 'react-hot-loader/patch'
import 'babel-polyfill';
import 'webpack-hot-middleware/client';
import App from './App';
import './index.css'
// import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
// import configureStore from './store/configureStore';

// let initialState;

const render = Component => {
  ReactDOM.render(
      <Component />,
    document.getElementById('root')
  )
}

let AppToRender;
fetch('/api/get-articles/1')
.then((res) => {
  return res.json();
})
.then((parsedRes) => {

  // covering App component with AppContainer for hot modules replacement for React in development
  AppToRender = process.env.NODE_ENV === 'development' ?
  () => {
    return (
      <AppContainer>
        <App articles={parsedRes}/>
      </AppContainer>
    );
  }
  : () => {
    return (
      <App articles={parsedRes}/>
    );
  };
render(AppToRender);
})


if (module.hot) {
  module.hot.accept('./App', () => {
    render(AppToRender)
  })
}