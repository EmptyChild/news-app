const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({      
      timestamp: true,      
      prettyPrint: true,
      colorize: true,
    }),
    new winston.transports.File({
      name: 'errors-log',    
      level: 'error',
      filename: 'errors.log', 
      timestamp: true,      
      prettyPrint: true,       
    }),
  ]
});

logger.on('error', (error) => {
  console.log('Unable to write log entry', error);
})

module.exports = logger;