let ignoreList = new Set();
let deleteList = new Set();

const config = require('../config.json')
const utils = require('./utils.js')
const sql = require('./sql.js')
let debug = config.debug;


function getIgnoreList() {
    return ignoreList
}

function getDeleteList() {
    return deleteList
}

/**
 * @param {string} item The path
 * @param {Boolean} isInit manage sql insert
 */
function addIgnoredItem(item, isInit) {
    ignoreList.add(item)
    if (isInit) return
    sql.addIgnoredItem(item, (err, result) => {})
}

/**
 * @param {string} item The path
 * @param {Boolean} isInit manage sql insert
 */
function addDeletedItem(item, isInit) {
    deleteList.add(item)
    if (isInit) return
    sql.addDeletedItem(item, (err, result) => {})
}

function deleteIgnoredItem(item) {
    ignoreList.delete(item)
    sql.removeIgnoredItem(item, (err, result) => {})
}

function deleteDeletedItem(item) {
    deleteList.delete(item)
    sql.removeDeletedItem(item, (err, result) => {})
}

function hasIgnoredItem(item) {
    let result = ignoreList.has(item)
    return result;
}


function hasDeletedItem(item) {
    let result = deleteList.has(item)
    return result;
}

module.exports = { getIgnoreList, getDeleteList, addIgnoredItem, addDeletedItem, deleteIgnoredItem, deleteDeletedItem, hasIgnoredItem, hasDeletedItem }