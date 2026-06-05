const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { chat } = require('../controllers/claim.controller');

router.use(authenticate);

router.post('/chat', chat);

module.exports = router;
