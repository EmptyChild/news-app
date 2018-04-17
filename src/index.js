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

// covering App component by <AppContainer> for react hot modules replacement
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

// rerender App if we have hot updates
if (module.hot) {
  module.hot.accept('./App', () => {
    render(AppToRender)
  })
}