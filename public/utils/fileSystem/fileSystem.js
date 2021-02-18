// https://ourcodeworld.com/articles/read/106/how-to-choose-read-save-delete-or-create-a-file-with-electron-framework

const rimraf = require('rimraf');
const fx = require('./mkdir-recursive');
const {map} = require('p-iteration');

const CustomedFileStats = require('./CustomedFileStats');

const toBase64Str = require('../base64/toBase64Str');
const fromBase64Str = require('../base64/fromBase64Str');

const {isFunction} = require('../variableType/isFunction');
const {isNonEmptyArray} = require('../variableType/isNonEmptyArray');

// https://github.com/electron/asar
// http://www.tc4shell.com/en/7zip/asar/
// Somehow using the "import" syntax would result in the following error:
// "Module not found: Can't resolve 'original-fs' in 'E:\Documents\Projects\Electron\School-VR\node_modules\asar\lib'"
//import asar from 'asar';
const asar = require('asar');

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');


/* from node.js fs implementation */

// https://github.com/nodejs/node/blob/6e56771f2a9707ddf769358a4338224296a6b5fe/lib/fs.js#L1694
const maybeCallBack = (cb) => {
  if (isFunction(cb)) {
    return cb;
  }

  //throw new ERR_INVALID_CALLBACK();
  throw new Error(`Callback: '${cb}' is not a function.`);
}

const assertEncoding = (encoding) => {
  if (encoding && !Buffer.isEncoding(encoding)) {
    //throw new ERR_INVALID_OPT_VALUE_ENCODING(encoding);
    throw new Error(`Invalid opt value encoding: ${encoding}`);
  }
};

const getOptions = (options, defaultOptions) => {
  if (options === null || options === undefined ||
      isFunction(options)) {
    return defaultOptions;
  }

  if (typeof options === 'string') {
    defaultOptions = { ...defaultOptions };
    defaultOptions.encoding = options;
    options = defaultOptions;
  } else if (typeof options !== 'object') {
    //throw new ERR_INVALID_ARG_TYPE('options', ['string', 'Object'], options);
    throw new Error(`Invalid argument type: 'options: ${options}' should be of one of the types: 'string', 'Object'.`);
  }

  if (options.encoding !== 'buffer') {
    assertEncoding(options.encoding);
  }

  return options;
}

/* end of from node.js fs implementation */


/* error handling */

const passbackControlToCallBack = (callBack, data) => {
  handleGeneralErrAndData(callBack, null, data);
};

const handleGeneralErr = (callBack, err) => {
  handleGeneralErrAndData(callBack, err);
};

const handleGeneralErrAndData = (callBack, err, data) => {
  console.log("fileSystem - handleGeneralErrAndData");
  const callBackCall = (newErr, theData) => {
    isFunction(callBack) && callBack(newErr, theData);
  };
  if (err) {
    console.error(err.stack);
    callBackCall(err, null);
  } else {
    callBackCall(null, data);
  }
};

/* end of error handling */


/* file api */

//const useFileHandle = (filePath, )

/**
 * !!! Important !!!
 * This exists() is different from fs.exists().
 * It returns callBack(err, data).
 * err is always null, so that promisifying exists() would not have the reject case.
 * data is included such that promisified exists() will always be resolved.
 * data is a Boolean indicating if the file exists.
 */
// https://nodejs.org/api/fs.html#fs_fs_access_path_mode_callback
const exists = (filePath, callBack) => {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    callBack(null, !Boolean(err));  // would throw error if callBack is undefined
  });
};

const existsSync = (filePath) => {
  return fs.existsSync(filePath);
};

const existsPromise = promisify(exists);

// for performance reasons
const writeFileAssumingDestDirExists = (filePath, content, callBack) => {
  fs.writeFile(filePath, content, (err) => {
    handleGeneralErr(callBack, err);
  });
}

// for performance reasons
const writeFileAssumingDestDirExistsSync = (filePath, content) => {
  fs.writeFileSync(filePath, content);
}

const writeFileAssumingDestDirExistsPromise = promisify(writeFileAssumingDestDirExists);

/**
 * writeFile would create any parent directories in filePath if not exist.
 * writeFile would replace the file if already exists. (same behaviour as fs.writeFile)
 * https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
 * https://stackoverflow.com/questions/16316330/how-to-write-file-if-parent-folder-doesnt-exist
 */
const writeFile = (filePath, content, callBack) => {
  const directoriesStr = dirname(filePath);
  const writeFileCallBack = () => {
    fs.writeFile(filePath, content, (err) => {
      handleGeneralErr(callBack, err);
    });
  };
  exists(directoriesStr, (_, isExists) => {
    if (!isExists) {  // directory does not exist
      createDirectoryIfNotExists(directoriesStr, (err) => {
        if (err) {
          handleGeneralErr(callBack, err);
          return;
        }
        writeFileCallBack();
      });
    } else {  // directory exists
      writeFileCallBack();
    }
  });
};

const writeFileSync = (filePath, content) => {
  const directoriesStr = dirname(filePath);
  if (!existsSync(directoriesStr)) {
    createDirectoryIfNotExistsSync(directoriesStr);
  }
  fs.writeFileSync(filePath, content);
};

const writeFilePromise = promisify(writeFile);

const createWriteStream = (outputPath) => {
  return fs.createWriteStream(outputPath);
};

const appendFile = (filePath, content, callBack) => {
  const directoriesStr = dirname(filePath);
  const appendFileCallBack = () => {
    fs.appendFile(filePath, content, (err) => {
      handleGeneralErr(callBack, err);
    });
  };
  exists(directoriesStr, (_, isExists) => {
    if (!isExists) {  // directory does not exist
      createDirectoryIfNotExists(directoriesStr, (err) => {
        if (err) {
          handleGeneralErr(callBack, err);
          return;
        }
        appendFileCallBack();
      });
    } else {  // directory exists
      appendFileCallBack();
    }
  });
}

const appendFileSync = (filePath, content) => {
  const directoriesStr = dirname(filePath);
  if (!existsSync(directoriesStr)) {
    createDirectoryIfNotExistsSync(directoriesStr);
  }
  fs.appendFileSync(filePath, content);
}

const appendFilePromise = promisify(appendFile);

const rename = (oldPath, newPath, callBack) => {
  fs.rename(oldPath, newPath, (err) => {
    handleGeneralErr(callBack, err);
  });
};

const renameSync = (oldPath, newPath) => {
  fs.renameSync(oldPath, newPath);
};

const renamePromise = promisify(rename);

// default text file
const defaultReadFileOptions = {
  encoding: 'utf8',
  flag: 'r'
};

const readFile = (filePath, options, callBack) => {
  callBack = maybeCallBack(callBack || options);
  options = getOptions(options, defaultReadFileOptions);
  fs.readFile(filePath, options, (err, data) => {
    handleGeneralErrAndData(callBack, err, data);
  });
};

const readFileSync = (filePath, options) => {
  options = getOptions(options, defaultReadFileOptions);
  return fs.readFileSync(filePath, defaultReadFileOptions);
};

const readFilePromise = promisify(readFile);

const createReadStream = (filePath) => {
  return fs.createReadStream(filePath);
};

// for performance reasons
const copyFileAssumingDestDirExists = (src, dest, callBack) => {
  if (src === dest) {
    passbackControlToCallBack(callBack, null);
    return;
  }

  fs.copyFile(src, dest, (err) => {
    handleGeneralErr(callBack, err);
  });
}

// for performance reasons
const copyFileAssumingDestDirExistsSync = (src, dest) => {
  if (src === dest) {
    return;
  }

  fs.copyFileSync(src, dest);
}

const copyFileAssumingDestDirExistsPromise = promisify(copyFileAssumingDestDirExists);

/**
 * copyFile and copyFileSync is structurally similar to writeFile and writeFileSync
 * copyFile would create any parent directories in filePath if not exist.
 * copyFile would replace the file if already exists. (at least that what I think)
 */
const copyFile = (src, dest, callBack) => {
  if (src === dest) {
    passbackControlToCallBack(callBack, null);
    return;
  }

  const destDirectoriesStr = dirname(dest);
  const copyFileCallBack = () => {
    fs.copyFile(src, dest, (err) => {
      handleGeneralErr(callBack, err);
    });
  };
  exists(destDirectoriesStr, (_, isExists) => {
    if (!isExists) {  // directory does not exist
      createDirectoryIfNotExists(destDirectoriesStr, (err) => {
        if (err) {
          handleGeneralErr(callBack, err);
          return;
        }
        copyFileCallBack();
      });
    } else {  // directory exists
      copyFileCallBack();
    }
  });
};

const copyFileSync = (src, dest) => {
  if (src === dest) {
    return;
  }

  const destDirectoriesStr = dirname(dest);
  if (!existsSync(destDirectoriesStr)) {
    createDirectoryIfNotExistsSync(destDirectoriesStr);
  }
  fs.copyFileSync(src, dest);
};

const copyFilePromise = promisify(copyFile);


/**
 * Note:
 * the return CustomedFileStats object has an additional 'path' property
 * compared to the default fs.Stats object
 * https://stackoverflow.com/questions/11659054/how-to-access-name-of-file-within-fs-callback-methods
 * https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_class_fs_stats
 */

const stat = (filePath, callBack) => {
  fs.stat(filePath, (err, stats) => {
    const customedStatsObj = new CustomedFileStats(stats, filePath);
    handleGeneralErrAndData(callBack, err, customedStatsObj);
  });
};

const statSync = (filePath) => {
  const statObj = fs.statSync(filePath);
  return new CustomedFileStats(statObj, filePath);
};

const statPromise = promisify(stat);

const isDirectory = (filePath, callBack) => {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      handleGeneralErr(err);
      return;
    }
    handleGeneralErrAndData(callBack, null, stats.isDirectory());
  })
};

const isDirectorySync = (filePath) => {
  return fs.statSync(filePath).isDirectory();
};

const isDirectoryPromise = promisify(isDirectory);

const base64Encode = (filePath, callBack) => {
  readFile(filePath, (err, data) => {
    handleGeneralErrAndData(callBack, err, toBase64Str(data));
  });
};

// https://stackoverflow.com/questions/24523532/how-do-i-convert-an-image-to-a-base64-encoded-data-url-in-sails-js-or-generally
const base64EncodeSync = (filePath) => {
  // read binary data
  const data = readFileSync(filePath);
  // convert binary data to base64 encoded string
  return toBase64Str(data);
}

const base64EncodePromise = promisify(base64Encode);

const base64Decode = (locationToSaveFile, encodedStr, callBack) => {
  writeFile(locationToSaveFile,
    fromBase64Str(encodedStr),
    (err) => { handleGeneralErr(callBack, err); });
};

const base64DecodeSync = (locationToSaveFile, encodedStr) => {
  writeFileSync(locationToSaveFile,
    fromBase64Str(encodedStr));
};

const base64DecodePromise = promisify(base64Decode);

/* end of file api */


/* asar - Electron Archive https://github.com/electron/asar/blob/master/lib/asar.js */

const createPackage = (src, dest, callBack) => {
  // https://github.com/electron/asar#transform
  // passing null as 3rd argument won't work
  // should pass {} (empty value) or _ => null (a function which returns nothing) or anything other than null or undefined
  createPackageWithOptions(src, dest, {}, callBack);
};

const createPackagePromise = promisify(createPackage);

const createPackageWithTransformOption = (src, dest, transformFunc, callBack) => {
  createPackageWithOptions(src, dest, { transform: transformFunc }, callBack);
};

const createPackageWithTransformOptionPromise = promisify(createPackageWithTransformOption);

// overwrite existing dest
const createPackageWithOptions = (src, dest, options, callBack) => {
  //console.log(asar);
  asar.createPackageWithOptions(src, dest, options, (err) => {
    if (!err) {
      console.log(`fileSystem - createPackageWithOptions: ${src} packaged to ${dest}`);
    }

    handleGeneralErr(callBack, err);
  });
};

const createPackageWithOptionsPromise = promisify(createPackageWithOptions);

const extractAll = (archive, dest) => {
  // asar would cache previous result!
  asar.uncache(archive);
  //asar.uncacheAll();
  // overwrite existing dest!
  asar.extractAll(archive, dest);
};

/* end of asar - Electron Archive */


/* directory api */

// somehow this is not working
// const defaultMkDirOptions = {
//   recursive: true
// };

// const mkdir = (dirPath, callBack) => {
//   fs.mkdir(dirPath, defaultMkDirOptions, (err) => {
//     handleGeneralErr(callBack, err);
//   });
// };

// const mkdirSync = (dirPath) => {
//   fs.mkdirSync(dirPath, defaultMkDirOptions);
// }

// use fx instead of fs
const mkdir = (dirPath, callBack) => {
  fx.mkdir(fs, path, dirPath, (err) => {
    handleGeneralErr(callBack, err);
  });
};

const mkdirSync = (dirPath) => {
  fx.mkdirSync(fs, path, dirPath);
}

const createDirectoryIfNotExists = (dirPath, callBack) => {
  exists(dirPath, (_, isExists) => {
    if (!isExists) {  // directory does not exist
      mkdir(dirPath, (mkDirErr) => {
        handleGeneralErr(callBack, mkDirErr);
      });
    } else {  // directory exists
      passbackControlToCallBack(callBack);
    }
  })
};

// https://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
const createDirectoryIfNotExistsSync = (dirPath) => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
  }
};

const createDirectoryIfNotExistsPromise = promisify(createDirectoryIfNotExists);

// https://askubuntu.com/questions/517329/overwrite-an-existing-directory
const createAndOverwriteDirectoryIfExists = (dirPath, callBack) => {
  myDelete(dirPath, (err) => {
    if (err) {
      handleGeneralErr(callBack, err);
    } else {
      mkdir(dirPath, (err) => {
        handleGeneralErr(callBack, err);
      });
    }
  });
}

const createAndOverwriteDirectoryIfExistsSync = (dirPath) => {
  myDeleteSync(dirPath);
  mkdirSync(dirPath);
}

const createAndOverwriteDirectoryIfExistsPromise = promisify(createAndOverwriteDirectoryIfExists);


/**
 *  Note:
 *  files returned by fs.readdir is an array of file name strings
 */
const readdir = (dirPath, callBack) => {
  fs.readdir(dirPath, (err, files) => {
    handleGeneralErrAndData(callBack, err, files);
  });
};

const readdirSync = (dirPath) => {
  return fs.readdirSync(dirPath);
};

const readdirPromise = promisify(readdir);

/**
 * Note:
 * the returned files is an array of CustomedStats objects
 * instead of the default array of file name strings
 * https://stackoverflow.com/questions/11659054/how-to-access-name-of-file-within-fs-callback-methods
 * https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_class_fs_stats
 */
const readdirWithStatPromise = async (dirPath) => {
  const fileNames = await readdirPromise(dirPath);
  if (!isNonEmptyArray(fileNames)) {
    return [];
  }

  const absolutePaths = fileNames.map(fileName => join(dirPath, fileName));
  const fileStatObjs = await map(absolutePaths, async (fileAbsolutePath) => {
    return await statPromise(fileAbsolutePath);
  });

  return fileStatObjs;
}

/* end of directory api */


/**
 * rimraf api
 * work for both file and directory
 * https://github.com/isaacs/rimraf
 */

const defaultMyDeleteOptions = Object.assign({
  maxBusyTries: 15
} , fs);

const myDelete = (filePath, callBack) => {
  rimraf(filePath, defaultMyDeleteOptions, (err) => {
    handleGeneralErr(callBack, err);
  });
};

const myDeleteSync = (filePath) => {
  rimraf.sync(filePath, defaultMyDeleteOptions);
}

const myDeletePromise = promisify(myDelete);

/* end of del api */


/* path api */

const sep = path.sep;

const getFileExtensionWithLeadingDot = (filePath) => {
  return path.extname(filePath);
};

const getFileExtensionWithoutLeadingDot = (filePath) => {
  return path.extname(filePath).substr(1);
};

const getFileNameWithExtension = (filePath) => {
  return path.basename(filePath);
};

const getFileNameWithoutExtension = (filePath) => {
  // https://stackoverflow.com/questions/4250364/how-to-trim-a-file-extension-from-a-string-in-javascript
  return path.basename(filePath).split('.').slice(0, -1).join('.');
};

const join = (...paths) => {
  return path.join(...paths);
};

const resolve = (...paths) => {
  return path.resolve(...paths);
}

const normalize = (filePath) => {
  return path.normalize(filePath);
}

const dirname = (filePath) => {
  return path.dirname(filePath);
}

/* end of path api */


module.exports = {
  // error handling
  // passbackControlToCallBack,
  // handleGeneralErr,
  // handleGeneralErrAndData,

  // file api
  exists,
  existsSync,
  existsPromise,
  writeFileAssumingDestDirExists,
  writeFileAssumingDestDirExistsSync,
  writeFileAssumingDestDirExistsPromise,
  writeFile,
  writeFileSync,
  writeFilePromise,
  createWriteStream,
  appendFile,
  appendFileSync,
  appendFilePromise,
  rename,
  renameSync,
  renamePromise,
  readFile,
  readFileSync,
  readFilePromise,
  createReadStream,
  copyFileAssumingDestDirExists,
  copyFileAssumingDestDirExistsSync,
  copyFileAssumingDestDirExistsPromise,
  copyFile,
  copyFileSync,
  copyFilePromise,
  //deleteFileSafe,
  //deleteFileSafeSync,
  stat,
  statSync,
  statPromise,
  isDirectory,
  isDirectorySync,
  isDirectoryPromise,
  base64Encode,
  base64EncodeSync,
  base64EncodePromise,
  base64Decode,
  base64DecodeSync,
  base64DecodePromise,

  // asar - Electron Archive
  createPackage,
  createPackagePromise,
  createPackageWithTransformOptionPromise,
  createPackageWithTransformOption,
  createPackageWithTransformOptionPromise,
  createPackageWithOptions,
  createPackageWithOptionsPromise,
  extractAll,

  // directory api
  //mkdir,
  //mkdirSync,
  createDirectoryIfNotExists,
  createDirectoryIfNotExistsSync,
  createDirectoryIfNotExistsPromise,
  createAndOverwriteDirectoryIfExists,
  createAndOverwriteDirectoryIfExistsSync,
  createAndOverwriteDirectoryIfExistsPromise,
  readdir,
  readdirSync,
  readdirPromise,
  readdirWithStatPromise,
  //deleteDirectorySafe,
  //deleteDirectorySafeSync,

  // rimraf api
  myDelete,
  myDeleteSync,
  myDeletePromise,

  // path api
  sep,
  getFileExtensionWithLeadingDot,
  getFileExtensionWithoutLeadingDot,
  getFileNameWithExtension,
  getFileNameWithoutExtension,
  join,
  resolve,
  normalize,
  dirname
};