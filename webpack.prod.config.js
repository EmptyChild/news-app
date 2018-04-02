var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: {
    app: './src/index',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  module: {        
    rules: [
      {
        use: [ 'babel-loader'],
        include: [
          path.resolve(__dirname, "src"),
        ],
        test: /\.js$/,        
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['eslint-loader'],
        include: [
          path.resolve(__dirname, "src"),
        ],
      },
      {
        test:   /\.css$/,
        loader: "style-loader!css-loader!postcss-loader"
      }
    ],
  }
}