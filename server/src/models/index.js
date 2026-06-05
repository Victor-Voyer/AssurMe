const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const basename = path.basename(__filename);

const initModels = (sequelize) => {
  const db = {};

  fs.readdirSync(__dirname)
    .filter((file) => file !== basename && file.endsWith('.js'))
    .forEach((file) => {
      const model = require(path.join(__dirname, file))(sequelize, DataTypes);
      db[model.name] = model;
    });

  Object.values(db).forEach((model) => {
    if (model.associate) model.associate(db);
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
};

module.exports = initModels;
