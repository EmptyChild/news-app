const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const getDBConnection = require('./getdbconnection');
const ArticleSchema = Schema({
  source: {
    name: {
      type: String,
      required: true
    }
  },
  author: {
    type: String,
  },
  title: {
  type: String,
  required: true,
  unique: true
  },
  description: String,
  publishedAt: {
    type: Date,
    required: true
  },  
  url: {
    type: String,
    required: true,
    unique: true
  },
  urlToImage: String,
  liked: {
    type: Boolean,
    default: false
  },
  numberOfViews: {
    type: Number,
    default: 0
  }
}, { minimize: false });

ArticleSchema.set('autoIndex', false);
const Article = getDBConnection('Article', ArticleSchema);
module.exports = Article;