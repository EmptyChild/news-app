const express = require('express');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.dev.config');
const PORT = process.env.PORT || 3000;

const logger = require('./logger');
const VError = require('verror').VError;
const path = require('path');
const Article = require('./ArticleModel');
const makeNewsApiRequest = require('./makeNewsApiRequest');

const favicon = require('serve-favicon');
var app = express();

app.use(favicon(path.join(__dirname, '../', '/dist/favicon-32x32.png')));

let lastUpdateAt;
let oldestArticleDate;
let numberOfVisitors = 0;
let currentDay = new Date();
let daysRunning = 1;
let visitorsPerDay = 0;

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
function processParsedResponse(parsedResponse) {
  if (parsedResponse.status === 'ok') {           
    let articles = parsedResponse.articles.map( (article) => {
      // converting a String date of publication to Date object
      return {
        ...article,
        publishedAt: new Date(article.publishedAt)
      };
    });    
    return parsedResponse;
    
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

function processMongodbOperationError(err) {
  if(err) {
    //covering MongoError with custom one to capture stack trace
    const error = new VError(err, 'Error while MongoDb operation');
    error.stack = VError.fullStack(error);
    return Promise.reject(error);
  }
}

function insertArticlesIntoDb(parsedResponse) {           
  if(parsedResponse.articles.length) {          
    let articles = parsedResponse.articles.map( (article) => {
    // converting a String date of publication to Date object
    return {
      ...article,
      publishedAt: new Date(article.publishedAt)
    };
  });
  logger.info(`Putting ${articles.length} articles in db`);
  // after getting news from news api we store them in our db with "liked" and "numberOfVews" fields     
  return Article.insertMany(articles, { ordered: false })
    .catch(processMongodbOperationError);
  } else {
    logger.info('No news to put in db')
    return Promise.resolve([]);
  }
}



function updateLastUdpateAtDate() {
  logger.info('Setting lastUpdateAt date')
  lastUpdateAt = new Date();
}

function updateOldestArticleDate(parsedResponse) {
  logger.info('updating oldestArticleInDb');
  const length = parsedResponse.articles.length;
  oldestArticleDate = new Date(parsedResponse.articles[length - 1].publishedAt);
  return parsedResponse;
}

function processError(err) {
  if(err) {
    logger.error(err)
  }
}

function increaseViews(articles) {
  // increasing number of views for each article before giving a response to user
  articles.forEach((article) => {
    article.numberOfViews += 1;
    article.save((err) => {
      if(err) {
        const error = new VError(err, 'Error while MongoDb operation');
        error.stack = VError.fullStack(error);
        logger.error(error);
      }
    })
  });
  return articles;         
}

function fetchFreshArticlesPage(options) {  
  logger.info('Making request to NewsApi')
  return makeNewsApiRequest(options)
    .then(parseJSON)
    .then(processParsedResponse)    
    .then(insertArticlesIntoDb);
};


function startServer() {

  app.get('/', function(req, res) {
    numberOfVisitors++;
    if(new Date().getDate() > currentDay.getDate()) {
      currentDay = new Date();
      daysRunning++;
    }
    visitorsPerDay = Math.floor(numberOfVisitors/daysRunning);
    res.sendFile(path.join(__dirname, '../','/dist/index.html'))
  });

  app.get('/api/get-articles', function processArticlesRequest(req, res, next) {
    const pagenumber = req.query.page;
    const filter = req.query.filter;
    logger.info(`Recived request for page ${pagenumber} of news`);
    let promise = Promise.resolve();
    promise.then(function searchArticlesInDb() {
      if(!filter) {
        return Article.find().sort('-publishedAt').skip((pagenumber-1)*20).limit(20).exec()
          .catch(processMongodbOperationError);
      } else {
        return Article.find()
          .or([
            {title: {$regex: new RegExp(`${filter}`, 'i')}}, 
            {description: {$regex: new RegExp(`${filter}`, 'i')}}
          ])
          .sort('-publishedAt').skip((pagenumber-1)*20).limit(20).exec()
          .catch(processMongodbOperationError);
      }       
    })
    .then(function processArticlesFoundInDb(articles) {
      const length = articles.length;
      if( length < 20 || (articles[length-1].publishedAt < oldestArticleDate)) {
        /* if user requests more articles than we have in db
          or articles amount is less 20,
          continue Promises chain to fetch older articles */
        return Promise.resolve();
      }
      increaseViews(articles);
      logger.info(`Sending page ${pagenumber} of news to user`);
      res.json({articles, visitorsPerDay});
      
      // if we successfully returned response for user, stopin execution of promises chain
      return Promise.reject();
    })
    .then(function fetchOlderArticles() {
      // formating Date of the oldest article in db to ISO format, adding 1 sec offset to prevent diplicate articles
      const options = {
        to: new Date(oldestArticleDate.getTime() - 1000).toISOString().slice(0,-5),
        pageSize: 100,
        q: filter ? filter : ''
      }
      if(filter) {
        logger.info(`No more news in db matching with "${filter}", requesting older news from NewsApi`);
      } else {
        logger.info(`No more news in db, requesting older news from NewsApi`);
      }
      return makeNewsApiRequest(options);
    })
    .then(parseJSON)
    .then((parsedResponse) => {
      if(!filter) {
        // if it wasn't filterd search, and we cached all articles, update oldestArticleDate
        return updateOldestArticleDate(parsedResponse)
      }
      //if it was, just passing response. Unless we don't update oldestArticleDate, 
      //we putting filtered articles in db, and can cache unfiltered ones later
      return parsedResponse;
    })
    .then(processParsedResponse)
    .then(insertArticlesIntoDb)
    .then(function respondToUserAfterFetchingArticles() {
      if(!filter) {
        return Article.find().sort('-publishedAt').skip((pagenumber-1)*20).limit(20).exec()
        .catch(processMongodbOperationError);
      } else {
        return Article.find()
        .or([
          {title: {$regex: new RegExp(`${filter}`, 'i')}}, 
          {description: {$regex: new RegExp(`${filter}`, 'i')}}
        ])
        .sort('-publishedAt').skip((pagenumber-1)*20).limit(20).exec()
        .catch(processMongodbOperationError);
      }
    })
    .then(increaseViews)
    .then((articles) => {
      logger.info(`Sending page ${pagenumber} of news to user`);
      res.json({articles, visitorsPerDay});     
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

  app.post('/api/like/:articleId', function processLikeRequest(req, res, next) {
    Article.findById(req.params.articleId).exec().then((article) => {
      article.liked = true;
      return article.save();
    })
    .catch(processMongodbOperationError)
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

  setInterval(function checkUpdatesAndRecalcVisitors() {
    // cheching for updates on NewsApi every 5 minutes and puttting them into db
    const options = {
      from: lastUpdateAt.toISOString().slice(0,-5),
      pageSize: 100
    };
    logger.info('Making request to NewsApi for fresh news')
    makeNewsApiRequest(options)
      .then(parseJSON)
      .then(processParsedResponse)    
      .then(insertArticlesIntoDb)
      .then(updateLastUdpateAtDate)
      .catch(processError);
  }, 5 * 60 * 1000)

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
  // before starting the server we should convince that we have articles stored in our db
  Article.count().then(function countArticlesInDb(count)  {
    if (count >= 20) {
      logger.info('We have enough articles in db, searching the newest article in db');
      // if amount of articles id enough, searching the newest article in db
      return Article.find().sort('-publishedAt').limit(1).exec();

    } else {
      // if there is no articles in db, 
      // or we have just put some there manually, just drop articles collection
      logger.info('Number of articles in db is invalid, dropping the collection');
      return Article.deleteMany().exec();        
    }
  })
  .catch(processMongodbOperationError)
  .then(function assignLastUpdateAt(articles) {
    // checking that we actually found an article from db
    if (articles && articles[0] && articles[0].publishedAt) {
      logger.info('Assigning LastUpdateDate');
      // adding 1 sec offset to prevent duplicate articles
      lastUpdateAt = new Date(articles[0].publishedAt.getTime() + 1000);
      // fetching new articles that may be published after the newest in db
      const options = {
        from: lastUpdateAt.toISOString().slice(0,-5),
        pageSize: 100
      };
      logger.info('Making request to NewsApi for fresh news')      
      return makeNewsApiRequest(options)
        .then(parseJSON)
        .then(processParsedResponse)
        .then(function fetchTheRestOfNewArticles(parsedResponse) {
          if(parsedResponse.totalResults > 100) {
            let promise = Promise.resolve()
            for(let i = 2; i <= parsedResponse.totalResults/100 + 1; i++) { 
              promise = promise.then(() => {
                logger.info(`Fetching page ${i} of fresh articles`);
                return fetchFreshArticlesPage({
                  ...options,
                  page: i,
                })
                .catch(function processFreshArticlesPageError(err) {
                  if(err) {
                    logger.error(`Error while fetching part ${i} of fresh news`)
                    logger.error(err)
                  }
                })
              })
            }
          }
          return parsedResponse;
        })
        .then((parsedResponse) => {
          if(parsedResponse.totalResults > 100) {
            logger.info('Putting part 1 of fresh news in db')
          }
          return parsedResponse;
        })
        .then(insertArticlesIntoDb)
        .then(updateLastUdpateAtDate)
        .then(function findOldestArticleInDb() {
          logger.info('Searching the oldest article in db');
          return Article.find().sort('publishedAt').limit(1).exec()
            .catch(processMongodbOperationError);
        })
        .then((articles) => {
          logger.info('Assigning oldestArticleDate');
          oldestArticleDate = articles[0].publishedAt;
        });
        return Promise.resolve();
    } else {      
      // if we droped collection, make a new request to NewsApi for articles
      logger.info('Db is empty, making request to news api for articles')
      return makeNewsApiRequest({ pageSize: 100 })
      .then(parseJSON)
      .then(updateOldestArticleDate)
      .then(processParsedResponse)
      .then(insertArticlesIntoDb)
      .then(updateLastUdpateAtDate);
    }    
  })
  .then(startServer)
  .catch(processError)
})()
