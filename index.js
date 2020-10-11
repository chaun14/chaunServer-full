const colors = require("colors"); // pour avoir une belle console
const db = require("./db");
const { loadApp } = require("./app");
const { loadFiles } = require("./modules/filesManager");
const debug = require("./config.json").debug
const list = require("./modules/listManager")
const utils = require("./modules/utils")
const status = require("./modules/statusManager")

const init = async() => {
    // prepare database
    let startTime = Date.now();
    await db.sequelize
        .sync({
            alter: true,
            logging: false,
        })
        .then(() => {
            finishTime = Date.now();
            console.log("[" + "LOADING".green + "]" + "[" + "MYSQL".yellow + "] " + "Database loaded in " + (finishTime - startTime) + "ms");
        });

    // init caches
    // add ignorelist to cache
    await db.ignoreList.findAll().then((ignoreList) => {
        ignoreList.forEach((item) => {
            if (!list.hasIgnoredItem(item)) {
                list.addIgnoredItem(item.path, true);
                if (debug)
                    utils.logDebug(
                        "[" + "INIT".cyan + "] " + "Adding " + item.path + " to ignoreList"
                    );
            }
        });
    });

    // check launcher status
    await db.settings.findOrCreate({ where: { id: 1 } }).then((result) => {

        status.setStatus(result[0].launcher_status, true)
        status.setActive(result[0].maintenance_active, true)
    });

    // load all files
    await loadFiles()

    // let's launch the server
    loadApp(db);
};

init();