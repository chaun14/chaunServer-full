const SqlString = require('sqlstring');
const config = require('../config.json')
const utils = require('./utils.js')

const debug = config.debug;


const mysql = require('mysql');

let db;

//async function mysqlConnect() {
function mysqlConnect() {
    console.log("Connexion à la bdd")
    db = /*await */ mysql.createConnection(config.database); // Recreate the connection, since the old one cannot be reused.
    /*await*/
    db.connect(function onConnect(err) { // The server is either down

        if (err) { // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(mysqlConnect, 10000); // We introduce a delay before attempting to reconnect,
        }
        console.log('connected as id ' + db.threadId);
        // to avoid a hot loop, and to allow our node script to
    }); // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    db.on('error', function onError(err) {
        console.log('db error', err);
        if (err.code == 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            mysqlConnect(); // lost due to either server restart, or a
        } else { // connnection idle timeout (the wait_timeout
            throw new Error("Connection idle timeout... Error -> " + err); // server variable configures this)
        }
    });
}

mysqlConnect()



/* ################################# Stats ################################# */
async function newRequest(type, time, callback) {
    const newRequest = `INSERT INTO requests(type, calc_time) VALUES(${SqlString.escape(type)}, '${time}');`;

    await db.query(newRequest, function(err, result, fields = null) {
        if (err) throw new Error("Une erreur est survenue lors de l'injection en base de données. Raison : " + err.message);

        if (debug) {
            utils.logDebugMysql("newRequest " + newRequest + "\n" + JSON.stringify(result))
        }
        callback(err, result);
    })
}

async function getTodayStats(callback) {
    let getTodayStats = `SELECT * FROM requests WHERE DATE(date) = CURDATE();`;

    await db.query(getTodayStats, function(err, results, fields = null) {
        if (err) throw new Error("Une erreur est survenue lors de l'injection en base de données. Raison : " + err.message);

        if (debug) {
            utils.logDebugMysql("getTodayStats " + getTodayStats + "\n" + JSON.stringify(results))
        }
        callback(err, results);
    })
}
/* ################################# End stats ################################# */




/* ################################# Status ################################# */
async function getSettings(callback) {
    const getSettings = `SELECT * FROM settings;`;

    await db.query(getSettings, function(err, settings, fields = null) {
        if (err) throw new Error("Une erreur est survenue lors de l'injection en base de données. Raison : " + err.message);

        if (debug) {
            utils.logDebugMysql("guildSetting " + getSettings + "\n" + JSON.stringify(settings))
        }
        callback(err, settings);
    })
}

async function initSettings(callback = null) {
    const query = `INSERT INTO settings (id, launcher_status) VALUES (1, 'Ok');`

    await db.query(query, function(err, newSettings = null, fields = null) {
        if (err) throw new Error("Une erreur est survenue lors de l'injection en base de données. Raison : " + err.message);

        if (debug) {
            utils.logDebugMysql("initSettings " + query)
        }
        //   callback(err, newSettings);
    })
}

async function setNewStatus(status, callback) {
    const setNewStatus = `UPDATE settings SET launcher_status = ${SqlString.escape(status)};`;

    await db.query(setNewStatus, function(err, newStatus, fields = null) {
        if (err) throw new Error("Une erreur est survenue lors de l'injection en base de données. Raison : " + err.message);

        if (debug) {
            utils.logDebugMysql("setNewStatus " + setNewStatus)
        }
        callback(err, newStatus);
    })
}
/* ################################# End status ################################# */




/* ################################# IgnoreList ################################# */
async function getIgnoreList(callback) {
    const getIgnoreList = `SELECT * FROM ignoreList;`;

    await db.query(getIgnoreList, function(err, ignoreList, fields = null) {
        if (err) throw new Error("Une erreur est survenue lors de l'injection en base de données. Raison : " + err.message);

        if (debug) {
            utils.logDebugMysql("getIgnoreList " + getIgnoreList + "\n" + JSON.stringify(ignoreList))
        }
        callback(err, ignoreList);
    })
}

async function addIgnoredItem(item, callback) {
    const addIgnoredItem = `INSERT INTO ignoreList(path) VALUES(${SqlString.escape(item)});`;

    await db.query(addIgnoredItem, function(err, result, fields) {
        if (err) throw new Error("Une erreur est survenue lors de l'injection en base de données. Raison : " + err.message);

        if (debug) {
            utils.logDebugMysql("addIgnoredItem " + addIgnoredItem + "\n" + JSON.stringify(result))
        }
        callback(err, result);
    })
}

async function removeIgnoredItem(item, callback) {

    const removeIgnoredItem = `DELETE FROM ignoreList WHERE ignoreList.path = ${SqlString.escape(item)};`;

    await db.query(removeIgnoredItem, function(err, result, fields = null) {
        if (err) throw new Error("Une erreur est survenue lors de l'injection en base de données. Raison : " + err.message);

        if (debug) {
            utils.logDebugMysql("removeIgnoredItem " + removeIgnoredItem + "\n" + JSON.stringify(result))
        }
        callback(err, result);
    })
}

/* ################################# End IgnoreList ################################# */





/* ################################# deleteList ################################# */

async function getDeleteList(callback) {
    const getDeleteList = `SELECT * FROM deleteList;`;

    await db.query(getDeleteList, function(err, deleteList, fields) {
        if (err) throw new Error("Une erreur est survenue lors de l'injection en base de données. Raison : " + err.message);

        if (debug) {
            utils.logDebugMysql("getDeleteList " + getDeleteList + "\n" + JSON.stringify(deleteList))
        }
        callback(err, deleteList);
    })
}

async function addDeletedItem(item, callback) {
    const addDeletedItem = `INSERT INTO deleteList(path) VALUES(${SqlString.escape(item)});`;

    await db.query(addDeletedItem, function(err, result, fields) {
        if (err) throw new Error("Une erreur est survenue lors de l'injection en base de données. Raison : " + err.message);

        if (debug) {
            utils.logDebugMysql("addDeletedItem " + addDeletedItem + "\n" + JSON.stringify(result))
        }
        callback(err, result);
    })
}

async function removeDeletedItem(item, callback) {

    const removeDeletedItem = `DELETE FROM deleteList WHERE deleteList.path = ${SqlString.escape(item)};`;

    await db.query(removeDeletedItem, function(err, result, fields) {
        if (err) throw new Error("Une erreur est survenue lors de l'injection en base de données. Raison : " + err.message);

        if (debug) {
            utils.logDebugMysql("removeDeletedItem " + removeDeletedItem + "\n" + JSON.stringify(result))
        }
        callback(err, result);
    })
}
/* ################################# End deleteList ################################# */



const createDeleteList = `
--
-- Structure de la table deleteList
--

CREATE TABLE IF NOT EXISTS deleteList (
  id int(255) NOT NULL AUTO_INCREMENT,
  path varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT 'path to deleted file',
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY path (path)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;`;

db.query(createDeleteList, function(err, results, fields) {
    if (err) {
        console.log(err.message);
    }
});

const createIgnoreList = `
--
-- Structure de la table ignoreList
--

CREATE TABLE IF NOT EXISTS ignoreList (
  id int(255) NOT NULL AUTO_INCREMENT,
  path varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT 'path to ignored file',
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY path (path)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
`;

db.query(createIgnoreList, function(err, results, fields) {
    if (err) {
        console.log(err.message);
    }
});


const createRequest = `
--
-- Structure de la table requests
--

CREATE TABLE IF NOT EXISTS requests (
  id int(255) NOT NULL AUTO_INCREMENT,
  type varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci NOT NULL,
  calc_time int(255) NOT NULL,
  date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
`;

db.query(createRequest, function(err, results, fields) {
    if (err) {
        console.log(err.message);
    }
});



const createSettings = `
CREATE TABLE IF NOT EXISTS settings (
    id int(11) NOT NULL AUTO_INCREMENT,
    launcher_status varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'Ok',
    PRIMARY KEY (id)
  ) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
  
`;

db.query(createSettings, function(err, results, fields) {
    if (err) {
        console.log(err.message);
    }
});

module.exports = { newRequest, getTodayStats, getSettings, initSettings, getIgnoreList, addIgnoredItem, removeIgnoredItem, getDeleteList, addDeletedItem, removeDeletedItem, setNewStatus }