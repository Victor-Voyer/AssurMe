const CONTRACT_TYPES = ['AUTO', 'HOME', 'HEALTH', 'LIFE', 'PHONE', 'OTHER'];

module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define(
    'Contract',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(...CONTRACT_TYPES),
        allowNull: false,
        defaultValue: 'OTHER',
      },
      insurer: DataTypes.STRING,
      policyNumber: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      renewalDate: DataTypes.DATE,
      premium: DataTypes.FLOAT,
      fileUrl: DataTypes.STRING,
    },
    {
      tableName: 'Contract',
      freezeTableName: true,
    }
  );

  Contract.associate = (models) => {
    Contract.belongsTo(models.User, { foreignKey: 'userId' });
    Contract.hasMany(models.Coverage, { foreignKey: 'contractId', onDelete: 'CASCADE' });
  };

  return Contract;
};
