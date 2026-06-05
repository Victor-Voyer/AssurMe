const { Contract, Coverage } = require('../config/db');
const { extractContractData } = require('./ai.service');
const { uploadToS3 } = require('./storage.service');
const { NotFoundError, ValidationError } = require('../utils/errors');

const contractInclude = [{ model: Coverage }];

const getContracts = async (userId) =>
  Contract.findAll({
    where: { userId },
    include: contractInclude,
    order: [['createdAt', 'DESC']],
  });

const getContract = async (id, userId) => {
  const contract = await Contract.findOne({
    where: { id, userId },
    include: contractInclude,
  });
  if (!contract) throw new NotFoundError('Contrat introuvable');
  return contract;
};

const createContract = async (data, userId) => {
  const { name, type, insurer, policyNumber, startDate, endDate, renewalDate, premium } = data;
  if (!name?.trim()) throw new ValidationError('Le nom du contrat est requis');

  return Contract.create({
    userId,
    name: name.trim(),
    type: type || 'OTHER',
    insurer,
    policyNumber,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    renewalDate: renewalDate ? new Date(renewalDate) : null,
    premium,
  });
};

const deleteContract = async (id, userId) => {
  const contract = await Contract.findOne({ where: { id, userId } });
  if (!contract) throw new NotFoundError('Contrat introuvable');
  await contract.destroy();
};

const processUpload = async (contractId, file, userId) => {
  const contract = await Contract.findOne({ where: { id: contractId, userId } });
  if (!contract) throw new NotFoundError('Contrat introuvable');
  if (!file) throw new ValidationError('Fichier requis');

  const fileUrl = await uploadToS3(file);
  const pdfBase64 = file.buffer.toString('base64');
  const extracted = await extractContractData(pdfBase64);

  await contract.update({
    fileUrl,
    insurer: extracted.insurer ?? contract.insurer,
    type: extracted.type ?? contract.type,
    policyNumber: extracted.policyNumber ?? contract.policyNumber,
    startDate: extracted.startDate ? new Date(extracted.startDate) : contract.startDate,
    endDate: extracted.endDate ? new Date(extracted.endDate) : contract.endDate,
    renewalDate: extracted.renewalDate ? new Date(extracted.renewalDate) : contract.renewalDate,
    premium: extracted.premium ?? contract.premium,
  });

  if (extracted.coverages?.length) {
    await Coverage.destroy({ where: { contractId } });
    await Coverage.bulkCreate(
      extracted.coverages.map((c) => ({
        contractId,
        name: c.name,
        details: c.details,
        limit: c.limit,
        deductible: c.deductible,
      }))
    );
  }

  return getContract(contractId, userId);
};

module.exports = {
  getContracts,
  getContract,
  createContract,
  deleteContract,
  processUpload,
};
