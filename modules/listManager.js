let ignoreList = new Set();


const config = require('../config.json')
const utils = require('./utils.js')
const db = require("../db")

let debug = config.debug;


function getIgnoreList() {
    return ignoreList
}

/**
 * @param {string} item The path
 * @param {Boolean} isInit manage sql insert
 */
function addIgnoredItem(item, isInit) {
    ignoreList.add(item)
    if (!isInit) db.ignoreList.create({ path: item })
}

/**
 * @param {string} item The path
 * @param {Boolean} isInit manage sql insert
 */
function deleteIgnoredItem(item, isInit) {
    ignoreList.delete(item)
    if (!isInit) db.ignoreList.destroy({ where: { path: item } })
}

/**
 * @param {string} item The path
 * @returns {boolean} does the item is ignored
 */
function hasIgnoredItem(item) {
    return ignoreList.has(item)
}


module.exports = { getIgnoreList, addIgnoredItem, deleteIgnoredItem, hasIgnoredItem }