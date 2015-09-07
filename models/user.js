var exception = require('../lib/exception');

exports.save = function (mongo, doc) {
  return function (cb) {
    mongo
      .db('blog')
      .collection('users')
      .insert(doc, function (err, res) {
        if (err) {
          return cb(exception(exception.DBError, err.message));
        }
        cb(null, res);
      });
  };
};

exports.get = function (mongo, name) {
  return function (cb) {
    mongo
      .db('blog')
      .collection('users')
      .findOne({"name": name}, {"_id": 0}, function (err, doc) {
        if (err) {
          return cb(exception(exception.DBError, err.message));
        }
        cb(null, doc);
      });
  };
};