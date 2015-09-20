var exception = require('../lib/exception');
var mongoTp = require('./mongoTemplate');

exports.save = function(mongo, doc) {
    return function(cb) {
        mongoTp(mongo, 'users')
            .insert(doc, function(err, res) {
                if (err) {
                    return cb(exception(exception.DBError, err.message));
                }
                cb(null, res);
            });
    };
};

exports.get = function(mongo, name) {
    return function(cb) {
        mongoTp(mongo, 'users')
            .findOne({
                "name": name
            }, {
                "_id": 0
            }, function(err, doc) {
                if (err) {
                    return cb(exception(exception.DBError, err.message));
                }
                cb(null, doc);
            });
    };
};
