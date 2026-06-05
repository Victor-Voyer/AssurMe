require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie');

    app.listen(PORT, () => {
      console.log(`Serveur AssurMe démarré sur le port ${PORT}`);
    });
  } catch (err) {
    console.error('Impossible de démarrer le serveur :', err.message);
    process.exit(1);
  }
};

start();
