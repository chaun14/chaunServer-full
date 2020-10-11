let javaFiles = new Map()


module.exports.getFiles = () => {
    return javaFiles
}

module.exports.setFiles = (newFiles) => {
    javaFiles = newFiles
}