const db = require("../db")


let status = "";
let isMaintenanceActive = true


function getStatus() {
    return status
}

function isActive() {
    return isMaintenanceActive
}

function setActive(newState, init) {
    isMaintenanceActive = newState

    if (!init) db.settings.update({ maintenance_active: isMaintenanceActive }, { where: { id: 1 } })
}

function setStatus(newStatus, init) {
    status = newStatus

    if (!init) db.settings.update({ launcher_status: newStatus }, { where: { id: 1 } })
}

module.exports = { getStatus, isActive, setActive, setStatus }