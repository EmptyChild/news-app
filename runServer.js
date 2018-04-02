const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.dev.config')

const path = require('path')
const server = require('./server');
const PORT = process.env.PORT || 3000;
const express = require('express');

if(process.env.NODE_ENV === 'development') {  
  const compiler = webpack(config);
  server.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  server.use(webpackHotMiddleware(compiler));
}
server.use(express.static('dist'))

server.listen(PORT, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", PORT, PORT)
  }
})