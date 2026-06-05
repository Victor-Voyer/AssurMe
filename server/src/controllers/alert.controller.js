const alertService = require('../services/alert.service');

const getAlerts = async (req, res, next) => {
  try {
    const alerts = await alertService.getAlerts(req.user.id);
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const alert = await alertService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAlerts, markAsRead };
