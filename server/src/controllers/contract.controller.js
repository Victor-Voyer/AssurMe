const contractService = require('../services/contract.service');

const getContracts = async (req, res, next) => {
  try {
    const contracts = await contractService.getContracts(req.user.id);
    res.json({ success: true, data: contracts });
  } catch (err) {
    next(err);
  }
};

const getContract = async (req, res, next) => {
  try {
    const contract = await contractService.getContract(req.params.id, req.user.id);
    res.json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
};

const createContract = async (req, res, next) => {
  try {
    const contract = await contractService.createContract(req.body, req.user.id);
    res.status(201).json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
};

const uploadContract = async (req, res, next) => {
  try {
    const result = await contractService.processUpload(req.params.id, req.file, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const deleteContract = async (req, res, next) => {
  try {
    await contractService.deleteContract(req.params.id, req.user.id);
    res.json({ success: true, message: 'Contrat supprimé' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getContracts,
  getContract,
  createContract,
  uploadContract,
  deleteContract,
};
