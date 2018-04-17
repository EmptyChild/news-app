const mongoose = require('mongoose');
const logger = require('./logger');
const VError = require('verror').VError;
console.log(process.env.MONGO_URI)
const connection = mongoose.createConnection('mongodb://nmikhaliuk:fd3218697@ds123193.mlab.com:23193/news-app');
connection.on('error', (error) => {
  const err = new VError(error, 'Db connection error');
  err.stack = VError.fullStack(error);
  logger.error(err);
});
connection.once('open', function() {
  logger.info('Successfully connected to database!')
});

module.exports = function getDBConnection(querry, Schema) {
  return connection.model(querry, Schema);
}