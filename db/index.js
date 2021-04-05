const config = require("../config.json");
const dbConfig = config.database;

const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  port: dbConfig.port,

  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin",
  },

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.settings = require("./models/settings")(sequelize, Sequelize);
db.ignoreList = require("./models/ignoreList")(sequelize, Sequelize);
db.stats = require("./models/stats")(sequelize, Sequelize);

module.exports = db;
