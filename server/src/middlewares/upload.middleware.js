const multer = require('multer');
const { ValidationError } = require('../utils/errors');

const ALLOWED_TYPES = ['application/pdf'];
const MAX_SIZE_MB = 10;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new ValidationError('Seuls les fichiers PDF sont acceptés'));
  },
});

module.exports = upload;
