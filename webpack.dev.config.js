var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: './src/index',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
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