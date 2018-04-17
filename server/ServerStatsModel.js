const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const getDBConnection = require('./getdbconnection');
const ServerStatsSchema = Schema({  
  numberOfVisitors: {
    type: Number,
    required: true
  },  

  daysRunning: {
    type: Number,
    required: true
  },
  visitorsPerDay: {
    type: Number,
    required: true,
  },
  lastServerStartDate: Date
}, { minimize: false });

ServerStatsSchema.set('autoIndex', false);
const ServerStats = getDBConnection('ServerStats', ServerStatsSchema);
module.exports = ServerStats;