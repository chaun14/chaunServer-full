let files = new Map();

module.exports.getFiles = () => {
  return files;
};

module.exports.setFiles = (newFiles) => {
  files = newFiles;
};
