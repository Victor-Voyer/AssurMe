const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');
const { ValidationError, UnauthorizedError, NotFoundError } = require('../utils/errors');

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
});

const register = async ({ email, password, firstName, lastName }) => {
  if (!email || !password || !firstName || !lastName) {
    throw new ValidationError('Tous les champs sont requis');
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ValidationError('Email déjà utilisé');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, firstName, lastName });
  return sanitizeUser(user);
};

const login = async ({ email, password }) => {
  if (!email || !password) throw new ValidationError('Email et mot de passe requis');

  const user = await User.findOne({ where: { email } });
  if (!user) throw new UnauthorizedError('Identifiants incorrects');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Identifiants incorrects');

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { token, user: sanitizeUser(user) };
};

const getMe = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('Utilisateur introuvable');
  return sanitizeUser(user);
};

module.exports = { register, login, getMe };
