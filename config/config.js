require('dotenv').config()

module.exports = {
  "development": {
    "username": "root",
    "password": process.env.DB_PASS,
    "database": "database_development_api",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": process.env.DB_PASS,
    "database": "database_test_api",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": process.env.DB_PASS,
    "database": "database_production_api",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
