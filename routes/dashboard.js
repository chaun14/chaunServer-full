const express = require("express");
const fs = require("fs");
const router = express.Router();

const db = require("../db");
const list = require("../modules/listManager.js");
const status = require("../modules/statusManager.js");
const gameFilesCache = require("../modules/gameFileManager");
const javaFilesCache = require("../modules/javaFileManager");
const fileManager = require("../modules/filesManager");
const config = require("../config.json");
const debug = config.debug;

router.get("/", async function (req, res) {
  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    /*
        sql.getTodayStats((err, results) => {

            const ignoredItemNumber = list.getIgnoreList().size
            const deletedItemNumber = list.getDeleteList().size

            let timeAverage;
            if (!results) {
                timeAverage = null;
            } else {

                let calc_times = results.map(result => result.calc_time); // extract times from query results
                timeAverage = numAverage(calc_times); // get the average
                timeAverage = timeAverage / 1000; // ms to s
                timeAverage = timeAverage.toFixed(3) // round
            }

        })

*/

    const ignoredItemNumber = list.getIgnoreList().size;
    const gameFilesCount = gameFilesCache.getFiles().size;
    const javaFilesCount = javaFilesCache.getFiles().size;

    //stats
    let stats = await db.stats.findAll({
      order: [["date", "DESC"]],
      limit: 31,
    });

    res.render("dashboard", { user: req.session.passport, stats: stats, message: "", messageType: "success", gameFiles: gameFilesCount, javaFiles: javaFilesCount, ignoredItemNumber: ignoredItemNumber });
  }
});

router.post("/manage/refresh", async function (req, res) {
  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    await fileManager.loadFiles();

    const ignoredItemNumber = list.getIgnoreList().size;
    const gameFilesCount = gameFilesCache.getFiles().size;
    const javaFilesCount = javaFilesCache.getFiles().size;

    //stats
    let stats = await db.stats.findAll({
      order: [["date", "DESC"]],
      limit: 31,
    });

    res.render("dashboard", { user: req.session.passport, stats: stats, message: "Refresh finished", messageType: "success", todayStats: "none", timeAverage: "none", gameFiles: gameFilesCount, javaFiles: javaFilesCount, ignoredItemNumber: ignoredItemNumber });
  }
});

/* ######################################### Begin statusManager ######################################### */
router.get("/manage/status", async function (req, res) {
  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    let actualStatus = status.getStatus();
    let isMaintenanceActive = status.isActive();

    res.render("status", { status: actualStatus, isActive: isMaintenanceActive, message: "", messageType: "success" });
  }
});

router.post("/manage/status", async function (req, res) {
  let newStatus = req.body.reason;

  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    if (req.body.checkbox == "ok") {
      console.log("Activation de la maintenance");
      if (newStatus == undefined || newStatus == "") {
        newStatus = "Launcher under maintenance, please retry again later";
      }

      status.setStatus(newStatus);
      status.setActive(true);

      res.render("status", { status: status.getStatus(), isActive: status.isActive(), message: "Launcher maintenance sucessfully activated", messageType: "success" });
    } else {
      console.log("Désactivation de la maintenance");
      status.setStatus(newStatus);
      status.setActive(false);

      res.render("status", { status: status.getStatus(), isActive: status.isActive(), message: "Launcher maintenance sucessfully stopped", messageType: "success" });
    }
  }
});
/* ######################################### End statusManager ######################################### */

/* ######################################### Begin ignorelist ######################################### */

router.get("/manage/ignorelist", async function (req, res) {
  let ignorelist = list.getIgnoreList();

  console.log(ignorelist);
  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    //   res.send()
    res.render("list", { list: ignorelist, type: "ignore", message: "", messageType: "success" });
  }
});

router.post("/manage/ignorelist/delete", async function (req, res) {
  let ignorelist = list.getIgnoreList();

  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    if (req.body.file == undefined || req.body.file == "") {
      return res.render("list", { list: ignorelist, type: "ignore", message: "Impossible de traiter votre requête", messageType: "error" });
    }
    let item = req.body.file;
    if (list.hasIgnoredItem(item)) {
      list.deleteIgnoredItem(item, false);

      res.render("list", { list: ignorelist, type: "ignore", message: "Supression réussie", messageType: "success" });
    } else {
      return res.render("list", { list: ignorelist, type: "ignore", message: "Élément à suppprimer introuvable", messageType: "error" });
    }
  }
});

router.post("/manage/ignorelist/add", async function (req, res) {
  const ignorelist = list.getIgnoreList();

  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    if (req.body.file == undefined || req.body.file == "") {
      return res.render("list", { list: ignorelist, type: "ignore", message: "Impossible de traiter votre requête", messageType: "error" });
    }
    let item = req.body.file;
    if (list.hasIgnoredItem(item)) {
      return res.render("list", { list: ignorelist, type: "ignore", message: "This file is already in the list", messageType: "error" });
    } else {
      list.addIgnoredItem(item, false);

      res.render("list", { list: ignorelist, type: "ignore", message: "File successfully added to the ignoreList", messageType: "success" });
    }
  }
});

router.post("/manage/ignorelist/edit", async function (req, res) {
  let ignorelist = list.getIgnoreList();

  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    if (req.body.oldItem == undefined || req.body.oldItem == "" || req.body.newItem == undefined || req.body.newItem == "") {
      return res.render("list", { list: ignorelist, type: "ignore", message: "Can't proceed your request", messageType: "error" });
    }

    let oldItem = req.body.oldItem;
    let newItem = req.body.newItem;
    if (oldItem == newItem) {
      return res.render("list", { list: ignorelist, type: "ignore", message: "The new file is the same than the old", messageType: "error" });
    }
    if (list.hasIgnoredItem(oldItem)) {
      list.deleteIgnoredItem(oldItem, false);
      list.addIgnoredItem(newItem, false);
      res.render("list", { list: ignorelist, type: "ignore", message: "File successfully edited", messageType: "success" });
    } else {
      return res.render("list", { list: ignorelist, type: "ignore", message: "This file isn't in the list", messageType: "error" });
    }
  }
});

router.post("/manage/ignorelist/export", function (req, res) {
  let ignoreList = list.getIgnoreList();

  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    let builder = { ignore: [] };
    for (let item of ignoreList) {
      builder.ignore.push(item);
    }
    res.setHeader("Content-disposition", "attachment; filename=" + "ignore.json");
    res.set("Content-Type", "text/json");
    res.send(builder);
  }
});

router.post("/manage/ignorelist/import", function (req, res) {
  if (req.session.passport == undefined) {
    res.redirect("/login");
  } else {
    let ignoreList = list.getIgnoreList();

    if (!req.files || Object.keys(req.files).length === 0) {
      res.render("list", { list: ignoreList, type: "ignore", message: "No file selected", messageType: "error" });

      return;
    }
    if (req.files.file.name.includes(".json") || req.files.file.name.includes(".txt")) {
      if (req.files.file.size > 2048) return res.render("list", { list: ignoreList, type: "ignore", message: "Sorry the given file is too big", messageType: "error" });

      ignoreList = list.getIgnoreList();

      fs.readFile(req.files.file.tempFilePath, (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        let content = data.toString();

        try {
          content = JSON.parse(content);
        } catch (err) {
          res.render("list", { list: ignoreList, type: "ignore", message: "Wrong json syntax", messageType: "error" });

          return;
        }
        console.log(content);

        content = content.ignore;

        let entrieCount = 0;

        content.forEach((line) => {
          if (line == "") return;
          if (list.hasIgnoredItem(line)) return;
          entrieCount = entrieCount + 1;
          list.addIgnoredItem(line);
        });
        res.render("list", { list: ignoreList, type: "ignore", message: entrieCount + " Entries added", messageType: "success" });
      });
    } else {
      return res.render("list", { list: ignoreList, type: "ignore", message: "Please upload a file with valid extension", messageType: "error" });
    }
  }
});

/* ######################################### End ignorelist ######################################### */

module.exports = router;

function numAverage(a) {
  let b = a.length,
    c = 0,
    i;
  for (i = 0; i < b; i++) {
    c += Number(a[i]);
  }
  return c / b;
}
