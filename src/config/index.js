// Central place for configuration. Everything comes from environment
// variables so no secrets or machine-specific values live in the code.
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/papertrail',
};
