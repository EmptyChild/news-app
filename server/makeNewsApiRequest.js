const querystring = require('querystring');
const https = require('https');
const logger = require('./logger');

const defaultOptions = {
  apiKey: '90a1c979bcb14acc868d6c829fe5bda7',
  sources: ['bbc-news', 'bloomberg', 'entertainment-weekly', 'ign', 'wired'].join(','),
  language: 'en'
}

module.exports = function makeNewsApiRequest(options) {
  const requestOptions = {
    ...defaultOptions,
    ...options
  }
  return new Promise((resolve, reject) => {
    const request = https.get('https://newsapi.org/v2/everything?' + querystring.stringify(requestOptions), (newsApiResponse) => {
      newsApiResponse.setEncoding('utf8');
      let fullResponse = '';
      newsApiResponse.on('data', (chunk) => { fullResponse += chunk; });
      newsApiResponse.on('end', () => {
        logger.info(`Recived response from News Api ${newsApiResponse.statusCode}: ${newsApiResponse.statusMessage}`);
        if (newsApiResponse.statusCode !== 200) {
          const error = new Error('Wrong response from News Api!');
          error.statusCode = 502;
          reject(error);
        }
        resolve(fullResponse);
      });        
    });
    request.on('error', (err) => {
      err.statusCode = 502;
      err.statusMessage = 'Unable to make a request to News Api';
      reject(err);
    })
  });
}

