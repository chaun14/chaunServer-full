module.exports = (sequelize, Sequelize) => {
  const settings = sequelize.define(
    "settings",
    {
      launcher_status: {
        type: Sequelize.TEXT(),
        allowNull: false,
        defaultValue: "Bienvenue sur votre launcher. Allez sur le dashboard de votre launcher pour désactiver la maintenance.",
      },
      maintenance_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_bin",
    }
  );

  return settings;
};
