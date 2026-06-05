const claimService = require('../services/claim.service');
const { ValidationError } = require('../utils/errors');

const chat = async (req, res, next) => {
  try {
    const { history = [], message } = req.body;
    if (!message?.trim()) throw new ValidationError('Message requis');

    const reply = await claimService.chat(history, message.trim());
    res.json({ success: true, data: { reply } });
  } catch (err) {
    next(err);
  }
};

module.exports = { chat };
