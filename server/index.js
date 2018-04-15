
const express = require('express');
// const bodyParser = require('body-parser');
// const session = require('express-session');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.dev.config');
const PORT = process.env.PORT || 3000;

const logger = require('./logger');
const path = require('path');
const Article = require('./ArticleModel');
const makeNewsApiRequest = require('./makeNewsApiRequest');

// const favicon = require('serve-favicon');
var app = express();

// app.use(favicon(path.join(__dirname, '../', '/dist/favicon.ico')));
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())
// app.use(session({ 
//   secret: 'SECRET',
//   resave: false,
//   saveUninitialized: true,
//  })); 
// app.use(passport.initialize());
// app.use(passport.session());

let lastUpdateAt;
let oldestArticleDate;

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../','/dist/index.html'))
});

function parseJSON(jsonResponse) {
  try {
    logger.info('Parsing JSON Response')
    let newsApiResponse = JSON.parse(jsonResponse);
    logger.info('Successfully parsed response from NewsApi');
    return newsApiResponse;
  } catch (error) {
    error.statusMessage = 'Problem with parsing JSON response';
    error.statusCode = 500;
    return Promise.reject(error)
  }
}

function insertArticlesIntoDb(parsedResponse) {
  if (parsedResponse.status === 'ok') {            
    if(parsedResponse.articles.length) {          
      let articles = parsedResponse.articles.map( (article) => {
      // converting a String date of publication to Date object
      return {
        ...article,
        publishedAt: new Date(article.publishedAt)
      };
    });
    logger.info('Putting articles in db');
    // after getting news from news api we store them in our db with "liked" and "numberOfVews" fields     
    return Article.insertMany(articles, { ordered: false });
    } else {
      logger.info('No news to put in db')
      return Promise.resolve([]);
    }
  } else if(parsedResponse.status === 'error') {
    const error = new Error(parsedResponse.message);
    error.statusCode = 502;
    return Promise.reject(error);
  } else {
    const error = new Error('Invalid JSON Response');
    error.statusCode = 502;
    return Promise.reject(error);
  }
}

function increaseViews(articles) {
  articles.forEach((article) => {
    article.numberOfViews += 1;
    article.save((err) => {
      if(err) {
        logger.error(err);
      }
    })
  });
  return articles;         
}

function updateLastUdpateAtDate() {
  lastUpdateAt = new Date();
}

function updateOldestArticleDate(parsedResponse) {
  const length = parsedResponse.articles.length;
  oldestArticleDate = new Date(parsedResponse.articles[length - 1].publishedAt);
  return parsedResponse;
}

function processError(err) {
  if(err) {
    logger.error(err)
  }
}

function fetchNewArticles() {
  const options = {
    from: lastUpdateAt.toISOString().slice(0,-5),
    pageSize: 100
  };
  logger.info('Making request to NewsApi for fresh news')
  return makeNewsApiRequest(options)
  .then(parseJSON)    
  .then(insertArticlesIntoDb)
  .then(updateLastUdpateAtDate)
  .catch(processError);
}

function startServer() {

  app.get('/api/get-articles/:pagenumber', function(req, res, next) {
    const pagenumber = req.params.pagenumber;
    console.log(Object.keys(req.query).length)
    logger.info(`Recived request for page ${pagenumber} of news`);
    Article.find().sort('-publishedAt').skip((pagenumber-1)*20).limit(20).exec().then((articles) => {
      if(articles.length === 0) {
        /* if user requests more articles than we stored in db,
          continue Promises chain to feth older articles */
        //return Article.find().sort('publishedAt').limit(1).exec()
        return Promise.resolve();
      }
      increaseViews(articles);
      logger.info(`Sending page ${pagenumber} of news to user`);
      res.json(articles);
      
      // if we successfully returned response for user, stopin execution of promises chain
      return Promise.reject();
    })
    .then((article) => {
      // formating Date of the oldest article in db to ISO format, adding 1 sec offset to prevent diplicate articles
      const options = {
        to: new Date(oldestArticleDate.getTime() - 1000).toISOString().slice(0,-5),
        pageSize: 100
      }
      logger.info(`No more news in db, requesting older news from NewsApi`);
      return makeNewsApiRequest(options);
    })
    .then(parseJSON)
    .then(updateOldestArticleDate)
    .then(insertArticlesIntoDb)
    .then(() => {
      return Article.find().sort('-publishedAt').skip((pagenumber-1)*20).limit(20).exec();
    })
    .then(increaseViews)
    .then((articles) => {
      logger.info(`Sending page ${pagenumber} of news to user`);
      res.json(articles);     
    })
    .catch(function processErrorAndRespond(err) {
      // if we stopping promises chain execution with error, response to user with error
      if(err) {        
        logger.error(err);
        res.statusCode = err.statusCode || 502;
        res.statusMessage = err.statusMessage || err.message || 'A problem with db has occured';
        res.end();     
      }
    })

  })

  app.post('/api/like/:articleId', function(req, res, next) {
    Article.findById(req.params.articleId).exec().then((article) => {
      article.liked = true;
      return article.save();
    })
    .then(() => {
      res.statusCode = 200;
      res.end();
    })
    .catch((err) => {
      logger.error(err);
      res.statusCode = 502;
      res.statusMessage = 'Problem with saving your like :-(';
      res.end();
    })
  })

  setInterval(fetchNewArticles, 60000)

  if(process.env.NODE_ENV === 'development') {  
    const compiler = webpack(config);
    app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
    app.use(webpackHotMiddleware(compiler));
  }
  app.use(express.static(path.join(__dirname, '../','/dist')))

  app.listen(PORT, function(error) {
    if (error) {
      logger.error(error)
    } else {
      let logMessage = `==> 🌎  Server is running on port ${PORT}. `;
      let devMessage = process.env.NODE_ENV === 'development' ? 
        `Open up http://localhost:${PORT}/ in your browser.`
        : '';
      logger.info(logMessage + devMessage);
    }
  })

}


(function firstServerLaunch() {

  logger.info('Preparing server to start');
  logger.info('Counting number articles in db')
  // before giving a response to user we should convince that we have articles stored in our db
  Article.count().then(function countArticlesInDb(count)  {
    if (count >= 20) {
      logger.info('We have enough articles in db, searching the newest article in db');
      //searching the newest article in db
      return Article.find().sort('-publishedAt').limit(1).exec();

    } else {
      // if it is first start of the server, and there is no articles in db, 
      // or we have just put some there manually, just drop articles collection
      logger.info('Number of articles in db is invalid, dropping the collection');
      return Article.deleteMany().exec();        
    }
  })
  .then(function assignLastUpdateAt(articles) {
    // checking that we actually found an article from db
    if (articles && articles[0] && articles[0].publishedAt) {
      logger.info('Assigning LastUpdateDate');
      // adding 1 sec offset to prevent duplicate articles
      lastUpdateAt = new Date(articles[0].publishedAt.getTime() + 1000);
      // fetching new articles that may be published after the newest in db
      
      return fetchNewArticles()
        .then(function findOldestArticleInDb() {
          logger.info('Searching the oldest article in db');
          return Article.find().sort('publishedAt').limit(1).exec()
        })
        .then((articles) => {
          logger.info('Assigning oldestArticleDate');
          oldestArticleDate = articles[0].publishedAt;
        });
    } else {      
      // if we droped collection, make a new request to NewsApi for articles
      logger.info('Db is empty, making request to news api for articles')
      return makeNewsApiRequest({ pageSize: 100 })
      .then(parseJSON)
      .then(updateOldestArticleDate)
      .then(insertArticlesIntoDb)
      .then(updateLastUdpateAtDate);
    }    
  })
  .then(startServer)
  .catch(processError)
})()
