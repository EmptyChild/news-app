const express = require('express');
// const bodyParser = require('body-parser');
// const session = require('express-session');
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

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../','/dist/index.html'))
});

app.get('/api/get-articles*', function firstServerLaunchCheck(req, res, next) {
  // before giving a response to user we should convince that we have articles stored in our db
  Article.count().then(function countArticlesInDb(count)  {
    //console.log(count)
    if (count >= 20) {
      if(!lastUpdateAt) {
        /* if amount of articles in db is fine, and we have no information about last update time,
        searching the newest article in db
        */
        return Article.find().sort('-publishedAt').limit(1).exec();
      }
      // if amount of articles in db is fine, and we have information about last update of articles, stop execution of promises chain
      return Promise.reject();
    } else {
      // if it is first start of the server, and there is no articles in db, 
      // or we have just put some there manually, just drop articles collection
      return Article.deleteMany().exec();        
    }
  })
  .then(function assignLastUpdateAt(article) {
    //console.log(article);
    // checking that we actually found an article from db
    if (article && article[0] && article[0].publishedAt) {
      // adding 1 sec offset to prevent duplicate articles
      lastUpdateAt = new Date(article[0].publishedAt.getTime() + 1000);
      //console.log(lastUpdateAt);
      // after assigning last update time, stop execution of promises chain
      return Promise.reject();
    }
    return Promise.resolve();    
  })
  .then(function makeFirstRequestToNewsApi() {
    // after droping collection make a new request to NewsApi for articles
    logger.info('Making request to news api')
    return makeNewsApiRequest();
  })
  .then(function parseJSON(jsonResponse) {
    try {
      let newsApiResponse = JSON.parse(jsonResponse);
      return newsApiResponse;
    } catch (error) {
      error.statusMessage = 'Problem with parsing JSON response';
      error.statusCode = 500;
      return Promise.reject(error)
    }
  })
  .then(function insertArticlesIntoDb(parsedResponse) {
    if (parsedResponse.status === 'ok') {            
      lastUpdateAt = new Date();    
      let articles = parsedResponse.articles.map( (article) => {
        // converting a String date of publication to Date object
        return {
          ...article,
          publishedAt: new Date(article.publishedAt)
        };
      });
      // after getting news from news api we store them in our db with "liked" and "numberOfVews" fields     
      return Article.insertMany(articles);
    } else if(parsedResponse.status === 'error') {
      const error = new Error(parsedResponse.message);
      error.statusCode = 502;
      return Promise.reject(error);
    }
  })
  .then(function increaseViews(articles) {
    return articles.map((article) => {
      article.numberOfViews += 1;
      article.save((err) => {
        if(err) {
          logger.error(err);
        }
      })
    });         
  })
  .then(function sendResponse(articles) {
    res.json(articles);
  })
  .catch(function processErrorAndProcede(err) {
    // if we stopping promises chain execution with error, response to user with error
    if(err) {        
      logger.error(err);
      res.statusCode = err.statusCode || 502;
      res.statusMessage = err.statusMessage || err.message || 'A problem with db has occured';
      res.end();     
    } else{
      // if not, just go to the next request handler
      next();
    }
  })
})

app.get('/api/get-articles/1', function(req, res, next) {
  // if we know last update time, and it passed more than 1 minute after it, check NewsApi for fresh news
  if(lastUpdateAt instanceof Date && (Date.now() - lastUpdateAt.getTime()) >= 60000) {
    // formating lastUpdateTime to ISO format, adding 1 sec offset to prevent diplicate articles
    const options = {
      from: lastUpdateAt.toISOString().slice(0,-5),
      pageSize: 100
    };

    makeNewsApiRequest(options).then((jsonResponse) => {
      try {
        let parsedResponse = JSON.parse(jsonResponse);
        if (parsedResponse.status === 'ok') {            
          lastUpdateAt = new Date();
          return parsedResponse;
          } else if(parsedResponse.status === 'error') {
          const error = new Error(parsedResponse.message);
          error.statusCode = 502;
          return Promise.reject(error);
        }
      } catch (error) {
        error.statusMessage = 'Problem with parsing JSON response';
        error.statusCode = 500;
        return Promise.reject(error)
      }
    })
    .then((parsedResponse) => {
      const totalResults = parsedResponse.totalResults;
      console.log(totalResults);
      // if we have more than 100 fresh news, fetch the rest of them
      if (totalResults > 100) {
        // we have already fetched page 1, so we starting from page 2
        let promise = Promise.resolve();
        for (let i = 2; i <= Math.ceil(totalResults / 100); i++) {
          const pagesOptions = {
            ...options,
            page: i,  
          }
          // making a queue of requests, to put request result into db without waiting all of them will be completed
          promise = promise.then(() => {
            console.log(`fetchig page ${i} of fresh news`)
            return makeNewsApiRequest(pagesOptions).then((jsonResponse) => {
              console.log(`Recived part ${i} of fresh news`);
              try {
                let parsedResp = JSON.parse(jsonResponse);
                if (parsedResp.status === 'error') {
                  return Promise.reject(new Error(parsedResp.message));
                }
                return parsedResp;
              } catch (error) {
                error.statusMessage = 'Problem with parsing JSON response';
                error.statusCode = 500;
                return Promise.reject(error)
              }
            })
            .then((parsedResp) => {
              let articles = parsedResp.articles;
              if(articles.length) {
                articles = articles.map( (article) => {
                  // converting a String date of publication to Date object
                  return {
                    ...article,
                    publishedAt: new Date(article.publishedAt)
                  };
                });
                return Article.insertMany(articles);
              }
              return Promise.reject();
            })
            .then((articles) => {
              console.log(`Successfully put part ${i} of fresh news in db`);
              return Promise.resolve();
            })
            .catch((err) => {
              if (err) {
                logger.error(err);
              }
              return Promise.resolve();
            })
          })
        }
      }
      // returning first 100 fresh news for further processing
      return parsedResponse;
        
    })
    .then((parsedResponse) => {
      let articles = parsedResponse.articles;
      // checking that we actually have fresh news
      if(articles.length) {
        // after getting first 100 fresh news from news api we store them in our db with "liked" and "numberOfVews" fields          
      articles = articles.map( (article) => {
        // converting a String date of publication to Date object
        return {
          ...article,
          publishedAt: new Date(article.publishedAt)
        };
      });
      return Article.insertMany(articles);
      }
      // if we have no fresh news, stop execution of promises chain
      return Promise.reject();
    })
    .then(() => {
      console.log(`Putting fresh news in db`);
      next();
    })
    .catch(err => {
      // if we stopping promises chain execution with error, response to user with error
      if(err) {        
        logger.error(err);
        res.statusCode = err.statusCode || 502;
        res.statusMessage = err.statusMessage || err.message || 'A problem with db has occured';
        res.end();     
      } else{
        // if not, just go to the next request handler
        next();
      }
    })
  } else {
    next();
  }
})

app.get('/api/get-articles/:pagenumber', function(req, res, next) {
  const pagenumber = req.params.pagenumber;
  Article.find().sort('-publishedAt').skip((pagenumber-1)*20).limit(20).exec().then((articles) => {
        // console.log(articles);
    if(articles.length === 0) {
      /* if user requests more articles than we stored in db,
         find the oldest article and fetch news from NewsApi older than this one */
      return Article.find().sort('publishedAt').limit(1).exec()
    }
    articles.map((article) => {
      article.numberOfViews += 1;
      article.save((err) => {
        if(err) {
          logger.error(err);
        }
      })
    })
    res.json(articles);
    
    // if we successfully returned response for user, stopin execution of promises chain
    return Promise.reject();
  })
  .then((article) => {
    // formating Date of the oldest article in db to ISO format, adding 1 sec offset to prevent diplicate articles
    const options = {
      to: oldestArticleDate = new Date(article[0].publishedAt.getTime() - 1000).toISOString().slice(0,-5)
    }
    return makeNewsApiRequest(options);
  })
  .then((jsonResponse) => {    
    try {
      let newsApiResponse = JSON.parse(jsonResponse);
      return newsApiResponse;
    } catch (error) {
      error.statusMessage = 'Problem with parsing JSON response';
      error.statusCode = 500;
      return Promise.reject(error)
    }
  })
  .then((parsedResponse) => {
    if (parsedResponse.status === 'ok') { 
      lastUpdateAt = new Date();     
      let articles = parsedResponse.articles.map( (article) => {
        // converting a String date of publication to Date object
        return {
          ...article,
          publishedAt: new Date(article.publishedAt)
        };
      });
      // after getting news from news api we store them in our db with "liked" and "numberOfVews" fields     
      return Article.insertMany(articles);
    } else if(parsedResponse.status === 'error') {
      const error = new Error(fullResponse.message);
      error.type = 'newsApiResponseError';
      error.statusCode = 502;
      return Promise.reject(error);
    }
  })
  .then((articles) => {
    articles.map((article) => {
      article.numberOfViews += 1;
      article.save((err) => {
        if(err) {
          logger.error(err);
        }
      })
    })
    res.json(articles);     
  })
  .catch((err) => {
    if(err) {
      logger.error(err);
      res.statusCode = 502;
      res.statusMessage = 'A problem with db has occured';
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

// app.get('/logout', function(req, res){
//   req.logout();
//   res.redirect('/');
// });

module.exports = app;

