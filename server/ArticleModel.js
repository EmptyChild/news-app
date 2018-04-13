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
  description: {
    type: String,
    required: true,
    unique: true
  },
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


// UserSchema.statics.createUser = function (username, password, todoListId, callback) {
//   const User = this; 
//   bcrypt.hash(password, 10, function hashPassword(err, hashedPassword) {
//     const user = new User({
//       username,
//       hashedPassword,
//       todoListId
//     });
//     user.save(function (err) {
//       if (err) {
//         console.log(err)
//         return;
//       } else {
//         callback();
//       }      
//     })
//   })
// }
ArticleSchema.set('autoIndex', false);
const Article = getDBConnection('Article', ArticleSchema);
module.exports = Article;