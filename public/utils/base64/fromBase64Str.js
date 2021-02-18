module.exports.fromBase64Str = function (base64EncodedStr) {
  return new Buffer(base64EncodedStr, 'base64');
};