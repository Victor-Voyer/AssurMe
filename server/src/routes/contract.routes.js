const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const {
  getContracts,
  getContract,
  createContract,
  uploadContract,
  deleteContract,
} = require('../controllers/contract.controller');

router.use(authenticate);

router.get('/', getContracts);
router.get('/:id', getContract);
router.post('/', createContract);
router.post('/:id/upload', upload.single('file'), uploadContract);
router.delete('/:id', deleteContract);

module.exports = router;
