const ALERT_TYPES = ['RENEWAL', 'DEADLINE', 'DUPLICATE'];

module.exports = (sequelize, DataTypes) => {
  const Alert = sequelize.define(
    'Alert',
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
      type: {
        type: DataTypes.ENUM(...ALERT_TYPES),
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dueDate: DataTypes.DATE,
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'Alert',
      freezeTableName: true,
      updatedAt: false,
    }
  );

  Alert.associate = (models) => {
    Alert.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Alert;
};
