const fileSystem = require('./fileSystem');


class CustomedFileStats {
  /**
   * 
   * @param {fs.Stats} fsStats 
   * @param {String} filePath
   */
  constructor(fsStats, filePath) {
    for (let key in fsStats) {
      this[key] = fsStats[key];
    }
  
    this.path = filePath;
  }

  get fileNameWithExtension() {
    return fileSystem.getFileNameWithExtension(this.path);
  }

  get fileNameWithoutExtension() {
    return fileSystem.getFileNameWithoutExtension(this.path);
  }

  get fileExtensionWithLeadingDot() {
    return fileSystem.getFileExtensionWithLeadingDot(this.path);
  }

  get fileExtensionWithoutLeadingDot() {
    return fileSystem.getFileExtensionWithoutLeadingDot(this.path);
  }
}

module.exports.CustomedFileStats = CustomedFileStats;