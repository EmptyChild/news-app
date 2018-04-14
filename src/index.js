import React from 'react';
import ReactDOM from 'react-dom';
import 'react-hot-loader/patch'
import 'babel-polyfill';
import 'webpack-hot-middleware/client';
import App from './App';
import './index.css';
import { AppContainer } from 'react-hot-loader';


const render = Component => {
  ReactDOM.render(
      <Component />,
    document.getElementById('root')
  )
}

let AppToRender = process.env.NODE_ENV === 'development' ?
() => {
  return (
    <AppContainer>
      <App />
    </AppContainer>
  );
}
: () => {
  return (
    <App />
  );
};
render(AppToRender);

if (module.hot) {
  module.hot.accept('./App', () => {
    render(AppToRender)
  })
}