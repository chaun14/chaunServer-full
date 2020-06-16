const express = require('express');
const router = express.Router();

const md5File = require('md5-file')
const recursiveReadSync = require('recursive-readdir-sync')
const fs = require('fs')
const chokidar = require('chokidar');
const hasha = require('hasha');

const utils = require("../modules/utils.js")
const list = require("../modules/listManager.js")
const status = require("../modules/statusManager.js")
const sql = require("../modules/sql.js")

const config = require('../config.json')
const debug = config.debug;

let fileList = new Map()

/* ================================================== files watcher ==================================================*/

const watcher = chokidar.watch('./files/', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
});
watcher
// action when a new file is detected
    .on('add', async path => {
        hasha.fromFile(path, { algorithm: 'sha1' }).then(hash => {

            const stats = fs.statSync(path);

            fileList.set(path, { "hash": hash, "size": stats.size });
            if (debug) console.log(`File ${path} (${hash}) has been added ${stats.size}`)

        }).catch(err => {
            console.error(err)

        })
    })
    // action when a file is changed
    .on('change', async path => {

        hasha.fromFile(path, { algorithm: 'sha1' }).then(hash => {
            const stats = fs.statSync(path);

            fileList.set(path, { "hash": hash, "size": stats.size });
            if (debug) console.log(`File ${path} has been changed`)
        }).catch(err => {
            console.error(err)


        })
    })
    // action when a file is deleted
    .on('unlink', async path => {
        fileList.delete(path)
        if (debug) console.log(`File ${path} has been removed`)
    });


/* ================================================== java files watcher ==================================================*/

let javaFileList = new Map()


const javaWatcher = chokidar.watch('./java/', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
});
javaWatcher
// action when a new file is detected
    .on('add', async path => {
        hasha.fromFile(path, { algorithm: 'sha1' }).then(hash => {

            const stats = fs.statSync(path);

            javaFileList.set(path, { "hash": hash, "size": stats.size });
            if (debug) console.log(`File ${path} (${hash}) has been added ${stats.size}`)

        }).catch(err => {
            console.error(err)

        })
    })
    // action when a file is changed
    .on('change', async path => {

        hasha.fromFile(path, { algorithm: 'sha1' }).then(hash => {
            const stats = fs.statSync(path);

            javaFileList.set(path, { "hash": hash, "size": stats.size });
            if (debug) console.log(`File ${path} has been changed`)
        }).catch(err => {
            console.error(err)


        })
    })
    // action when a file is deleted
    .on('unlink', async path => {
        javaFileList.delete(path)
        if (debug) console.log(`File ${path} has been removed`)
    });






/* ================================================== Routes ==================================================*/



// quand un launcher get la liste de téléchargement
router.get('/files', function(req, res) {

    const initialTime = Date.now()
    let object = { "files": [] };

    // list all Map elements
    for (var [path, values] of fileList) {

        // builder
        object.files.push({
            "path": path.slice(6).replace(/\\/g, "/"),
            "size": values.size,
            "sha1": values.hash
        })



    }

    // so that the browser and the launcher see that it's xml
    res.set('Content-Type', 'text/json');

    // we finalize our tags and send our generated xml object
    const finalTime = Date.now()

    // info log
    console.log("[INFO] ".brightBlue + `Listing of `.yellow + `${fileList.size}`.rainbow + ` files in `.yellow + (finalTime - initialTime) + "ms for ".yellow + (req.connection.remoteAddress).magenta)

    // send list to launcher
    res.send(object)

    // stats
    sql.newRequest("getfiles", finalTime - initialTime, (err, result) => {})

});

// quand un launcher get la liste de téléchargement de java
router.get('/java', function(req, res) {

    const initialTime = Date.now()
    let object = { "files": [] };

    // list all Map elements
    for (var [path, values] of javaFileList) {

        // builder
        object.files.push({
            "path": path.slice(5).replace(/\\/g, "/"),
            "size": values.size,
            "sha1": values.hash
        })



    }

    // so that the browser and the launcher see that it's xml
    res.set('Content-Type', 'text/json');

    // we finalize our tags and send our generated xml object
    const finalTime = Date.now()

    // info log
    console.log("[INFO] ".brightBlue + `Listing of `.yellow + `${javaFileList.size}`.rainbow + ` java files in `.yellow + (finalTime - initialTime) + "ms for ".yellow + (req.connection.remoteAddress).magenta)

    // send list to launcher
    res.send(object)

});


// pour ne pas afficher une page vide moche
router.get('/', function(req, res) {
    res.send(`chaunLauncher's download server by <a href="https://chaun14.fr/">chaun14</a><br><a href="/login">Login</a>`)
});

// gestion de l'activation du launcher
router.get('/status', function(req, res) {
    let statusObject = { active: true, message: "" }
    let actualStatus = status.getStatus()

    if (actualStatus !== "") {
        statusObject.active = false
        statusObject.message = actualStatus
    }

    res.set('Content-Type', 'text/json');
    res.send(statusObject)
});


router.get('/ignore', function(req, res) {
    ignoreList = list.getIgnoreList()

    let builder = { ignore: [] };
    for (let item of ignoreList) {

        builder.ignore.push(item)

    }
    res.set('Content-Type', 'text/json');
    res.send(builder)
});



module.exports = router;