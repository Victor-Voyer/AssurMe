require('dotenv').config();

const { Sequelize } = require('sequelize');
const initModels = require('../models');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

const models = initModels(sequelize);

module.exports = { sequelize, ...models };
