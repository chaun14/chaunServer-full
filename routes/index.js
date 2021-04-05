const express = require("express");
const router = express.Router();

const utils = require("../modules/utils.js");
const list = require("../modules/listManager.js");
const status = require("../modules/statusManager.js");
const gameFilesCache = require("../modules/gameFileManager");
const javaFilesCache = require("../modules/javaFileManager");

const config = require("../config.json");
const db = require("../db/index.js");
const debug = config.debug;

/* ================================================== Routes ==================================================*/

// quand un launcher get la liste de téléchargement
router.get("/files", async function (req, res) {
  let fileList = gameFilesCache.getFiles();

  const initialTime = Date.now();
  let object = { files: [] };

  // list all Map elements
  for (var [path, values] of fileList) {
    // builder
    object.files.push({
      path: path.slice(6).replace(/\\/g, "/"),
      size: values.size,
      sha1: values.hash,
    });
  }

  // so that the browser and the launcher see that it's xml
  res.set("Content-Type", "text/json");

  // we finalize our tags and send our generated xml object
  const finalTime = Date.now();

  // info log
  console.log("[INFO] ".brightBlue + `Listing of `.yellow + `${fileList.size}`.rainbow + ` files in `.yellow + (finalTime - initialTime) + "ms for ".yellow + req.connection.remoteAddress.magenta);

  // send list to launcher
  res.send(object);

  // stats
  const stats = await db.stats.findOrCreate({ where: { date: Date.now() } });
  db.stats.update({ count: stats[0].count + 1 }, { where: { date: Date.now() } });
});

// quand un launcher get la liste de téléchargement de java
router.get("/java", function (req, res) {
  const initialTime = Date.now();

  let object = { files: [] };

  let javaFileList = javaFilesCache.getFiles();

  console.log(javaFileList.size);

  // list all Map elements
  for (var [path, values] of javaFileList) {
    // builder
    object.files.push({
      path: path.slice(5).replace(/\\/g, "/"),
      size: values.size,
      sha1: values.hash,
    });
  }

  // so that the browser and the launcher see that it's xml
  res.set("Content-Type", "text/json");

  // we finalize our tags and send our generated xml object
  const finalTime = Date.now();

  // info log
  console.log("[INFO] ".brightBlue + `Listing of `.yellow + `${javaFileList.size}`.rainbow + ` java files in `.yellow + (finalTime - initialTime) + "ms for ".yellow + req.connection.remoteAddress.magenta);

  // send list to launcher
  res.send(object);
});

// pour ne pas afficher une page vide moche
router.get("/", function (req, res) {
  res.send(`chaunLauncher's download server by <a href="https://chaun14.fr/">chaun14</a><br><a href="/login">Login</a>`);
});

// gestion de l'activation du launcher
router.get("/status", function (req, res) {
  let statusObject = { active: status.isActive(), message: status.getStatus(), version: require("../package.json").version };

  res.set("Content-Type", "text/json");
  res.send(statusObject);
});

router.get("/ignore", function (req, res) {
  ignoreList = list.getIgnoreList();

  let builder = { ignore: [] };
  for (let item of ignoreList) {
    builder.ignore.push(item);
  }
  res.set("Content-Type", "text/json");
  res.send(builder);
});

module.exports = router;
