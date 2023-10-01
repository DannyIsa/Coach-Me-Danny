"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("measure_logs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      trainee_id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      height: {
        type: Sequelize.FLOAT,
      },
      weight: {
        type: Sequelize.FLOAT,
      },
      chest_perimeter: {
        type: Sequelize.FLOAT,
      },
      hip_perimeter: {
        type: Sequelize.FLOAT,
      },
      bicep_perimeter: {
        type: Sequelize.FLOAT,
      },
      thigh_perimeter: {
        type: Sequelize.FLOAT,
      },
      waist_perimeter: {
        type: Sequelize.FLOAT,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("measure_logs");
  },
};
