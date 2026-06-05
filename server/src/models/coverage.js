module.exports = (sequelize, DataTypes) => {
  const Coverage = sequelize.define(
    'Coverage',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      contractId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      details: DataTypes.STRING,
      limit: DataTypes.FLOAT,
      deductible: DataTypes.FLOAT,
    },
    {
      tableName: 'Coverage',
      freezeTableName: true,
      timestamps: false,
    }
  );

  Coverage.associate = (models) => {
    Coverage.belongsTo(models.Contract, { foreignKey: 'contractId' });
  };

  return Coverage;
};
