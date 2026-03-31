"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("audit_logs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4, // باش السيستيم يعطي ID طويل ومعقد بوحدو
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true, // يقدر يكون السيستيم اللي دار العملية (System event)
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false, // مثلا: "LOGIN", "DELETE_PRODUCT", "ADJUST_STOCK"
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true, // تفاصيل إضافية (الاسم القديم، الاسم الجديد...)
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // هادي كتمسح الجدول إلا بغيتي ترجعي اللور (Rollback)
    await queryInterface.dropTable("audit_logs");
  },
};
