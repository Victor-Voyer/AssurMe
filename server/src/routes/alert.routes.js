const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { getAlerts, markAsRead } = require('../controllers/alert.controller');

router.use(authenticate);

router.get('/', getAlerts);
router.patch('/:id/read', markAsRead);

module.exports = router;
