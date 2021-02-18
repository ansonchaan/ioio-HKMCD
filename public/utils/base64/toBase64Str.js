module.exports.toBase64Str = function (data) {
  return new Buffer(data).toString('base64');
};