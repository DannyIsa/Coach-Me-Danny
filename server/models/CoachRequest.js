"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CoachRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Trainee, {
        foreignKey: "trainee_id",
        targetKey: "id",
        onDelete: "cascade",

      });
      this.belongsTo(models.Coach, {
        foreignKey: "coach_id",
        targetKey: "id",
        onDelete: "cascade",

      });
    }
  }
  CoachRequest.init(
    {
      coach_id: DataTypes.INTEGER,
      trainee_id: DataTypes.INTEGER,
      trainee_name: DataTypes.STRING,
      content: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "CoachRequest",
      tableName: "coach_requests",
      underscored: true,
    }
  );
  return CoachRequest;
};
