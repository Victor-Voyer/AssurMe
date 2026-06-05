module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'User',
      freezeTableName: true,
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Contract, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Alert, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return User;
};
