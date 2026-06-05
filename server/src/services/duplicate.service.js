const { Contract, Coverage } = require('../config/db');

const detectDuplicates = async (userId) => {
  const contracts = await Contract.findAll({
    where: { userId },
    include: [{ model: Coverage }],
  });

  const duplicates = [];
  const seen = new Map();

  for (const contract of contracts) {
    for (const coverage of contract.Coverages) {
      const key = coverage.name.toLowerCase().trim();
      if (seen.has(key)) {
        duplicates.push({
          coverage: coverage.name,
          contract1: seen.get(key).contractName,
          contract2: contract.name,
        });
      } else {
        seen.set(key, { contractName: contract.name, contractId: contract.id });
      }
    }
  }

  return duplicates;
};

module.exports = { detectDuplicates };
