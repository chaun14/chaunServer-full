function logInfo(message) {
    console.log("[" + "INFO".brightBlue + "] " + message)
}

function logDebug(message) {
    console.log("[" + "DEBUG".magenta + "] " + message.white)
}

function logDebugMysql(message) {
    console.log("[" + "DEBUG".magenta + "] " + "[" + "MYSQL".yellow + "] " + message.white)
}

function logError(message) {
    console.log("[" + "ERROR".red + "] " + message.red)
}

module.exports = { logInfo, logDebug, logDebugMysql, logError }