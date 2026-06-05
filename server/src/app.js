const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth.routes');
const contractRoutes = require('./routes/contract.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AssurMe API opérationnelle' });
});

app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);

app.use(errorHandler);

module.exports = app;
