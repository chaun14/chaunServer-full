let status = "";
const sql = require('./sql.js')


function getStatus() {
    return status
}

function isActive() {
    return status === "" ? false : true;
}

function setActive(newStatus) {
    status = newStatus
    sql.setNewStatus(newStatus, (err, result) => {
        err ? console.log('Erreur : ' + err) : null;
        result ? console.log('Resultat : ' + result) : null;
    });
}

async function setStatus(newStatus) {
    if (!newStatus || newStatus === "") return console.error("New status can't be empty");
    status = newStatus
    sql.setNewStatus(newStatus, (err, result) => {
        err ? console.log('Erreur : ' + err) : null;
        result ? console.log('Resultat : ' + result) : null;
    })
}

module.exports = { getStatus, isActive, setActive, setStatus }