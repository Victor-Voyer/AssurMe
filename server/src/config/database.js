require('dotenv').config();

const common = {
  dialect: 'postgres',
  use_env_variable: 'DATABASE_URL',
};

module.exports = {
  development: { ...common },
  test: { ...common },
  production: { ...common },
};
