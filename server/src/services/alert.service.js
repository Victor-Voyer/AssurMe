const { addDays } = require('date-fns');
const { Op } = require('sequelize');
const { Contract, Alert } = require('../config/db');
const { NotFoundError } = require('../utils/errors');
const { detectDuplicates } = require('./duplicate.service');

const ALERT_DAYS_BEFORE = 30;

const generateRenewalAlerts = async (userId) => {
  const now = new Date();
  const threshold = addDays(now, ALERT_DAYS_BEFORE);

  const contracts = await Contract.findAll({
    where: {
      userId,
      renewalDate: { [Op.lte]: threshold, [Op.gte]: now },
    },
  });

  for (const contract of contracts) {
    const message = `Votre contrat "${contract.name}" arrive à renouvellement le ${contract.renewalDate.toLocaleDateString('fr-FR')}.`;

    const existing = await Alert.findOne({
      where: { userId, type: 'RENEWAL', dueDate: contract.renewalDate, message },
    });

    if (!existing) {
      await Alert.create({
        userId,
        type: 'RENEWAL',
        message,
        dueDate: contract.renewalDate,
      });
    }
  }
};

const generateDuplicateAlerts = async (userId) => {
  const duplicates = await detectDuplicates(userId);

  for (const dup of duplicates) {
    const message = `Garantie "${dup.coverage}" en doublon entre "${dup.contract1}" et "${dup.contract2}".`;

    const existing = await Alert.findOne({
      where: { userId, type: 'DUPLICATE', message },
    });

    if (!existing) {
      await Alert.create({
        userId,
        type: 'DUPLICATE',
        message,
        dueDate: new Date(),
      });
    }
  }
};

const syncAlerts = async (userId) => {
  await generateRenewalAlerts(userId);
  await generateDuplicateAlerts(userId);
};

const getAlerts = async (userId) => {
  await syncAlerts(userId);
  return Alert.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
};

const markAsRead = async (alertId, userId) => {
  const alert = await Alert.findOne({ where: { id: alertId, userId } });
  if (!alert) throw new NotFoundError('Alerte introuvable');
  await alert.update({ isRead: true });
  return alert;
};

module.exports = { getAlerts, markAsRead, syncAlerts, generateRenewalAlerts };
