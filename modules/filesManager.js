const recursive = require("recursive-readdir");
const gameFilesCache = require("./gameFileManager");
const javaFilesCache = require("./javaFileManager");
const hashFiles = require("hash-files");
const fs = require("fs");
const debug = require("../config.json").debug;

module.exports.loadFiles = () => {
  return new Promise(async (resolve, reject) => {
    let gameFiles = await recursive("./files");
    let files = new Map();
    for (let path of gameFiles) {
      let hash = hashFiles.sync({ files: path });

      const stats = fs.statSync(path);

      files.set(path, { hash: hash, size: stats.size });
      if (debug) console.log(`File ${path} (${hash}) has been added ${stats.size}`);
    }
    gameFilesCache.setFiles(files);

    let javaFiles = await recursive("./java");
    files = new Map();
    for (let path of javaFiles) {
      let hash = hashFiles.sync({ files: path });
      const stats = fs.statSync(path);

      files.set(path, { hash: hash, size: stats.size });

      if (debug) console.log(`File ${path} (${hash}) has been added ${stats.size}`);
    }
    javaFilesCache.setFiles(files);

    resolve();
  });
};
