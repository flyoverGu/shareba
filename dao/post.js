var marked = require('marked');
var moment = require('moment');
var ObjectID = require('mongodb').ObjectID;
var Post = require('../models/post');
var mongoTp = require('./mongoTemplate');

var exception = require('../lib/exception');

exports.save = function(mongo, user, data) {
    return function(cb) {
        var doc = new Post(data, user);
        getMongo(mongo).insert(doc, function(err, res) {
            if (err) {
                return cb(exception(exception.DBError, err.message));
            }
            cb(null, res);
        });
    };
};

exports.getTen = function(mongo, name, page) {
    var query = {};
    if (name) {
        query.name = name;
    }
    return function(cb) {
        getMongo(mongo).find(query)
            .sort({
                time: -1
            })
            .skip((page - 1) * 10)
            .limit(10)
            .toArray(function(err, docs) {
                handlePosts(err, docs, cb);
            });
    };
};

exports.count = function(mongo, name) {
    var query = {};
    if (name) {
        query.name = name;
    }
    return function(cb) {
        getMongo(mongo).count(query, function(err, res) {
            if (err) {
                return cb(exception(exception.DBError, err.message));
            }
            cb(null, res);
        });
    };
};

exports.getArchive = function(mongo) {
    return function(cb) {
        mongo
            .db('blog')
            .collection('posts')
            .find({}, {
                "time": 1,
                "title": 1
            })
            .sort({
                time: -1
            })
            .toArray(function(err, docs) {
                if (err) {
                    return cb(exception(exception.DBError, err.message));
                }
                docs.forEach(function(doc) {
                    doc.time = moment(doc.time).format('YYYY-MM-DD');
                });
                cb(null, docs);
            });
    };
};

exports.getTags = function(mongo) {
    return function(cb) {
        mongo
            .db('blog')
            .collection('posts')
            .distinct("tags", function(err, res) {
                if (err) {
                    return cb(exception(exception.DBError, err.message));
                }
                cb(null, res);
            });
    };
};

exports.getTag = function(mongo, tag) {
    return function(cb) {
        getMongo(mongo).find({
                "tags": tag
            }, {
                "title": 1,
                "content": 1,
                "tags": 1,
                "time": 1
            })
            .toArray(function(err, docs) {
                handlePosts(err, docs, cb);
            });
    };
};

exports.search = function(mongo, keyword) {
    var pattern = new RegExp(keyword, "i");
    return function(cb) {
        getMongo(mongo).find({
                "title": pattern
            }, {
                "time": 1,
                "title": 1
            })
            .toArray(function(err, docs) {
                if (err) {
                    return cb(exception(exception.DBError, err.message));
                }
                docs.forEach(function(doc) {
                    doc.time = moment(doc.time).format('YYYY-MM-DD');
                });
                cb(null, docs);
            });
    };
};

exports.getOne = function(mongo, id) {
    return function(cb) {
        getMongo(mongo).findAndModify({
            "_id": new ObjectID(id)
        }, [], {
            "$inc": {
                pv: 1
            }
        }, {
            new: true
        }, function(err, doc) {
            handlePost(err, doc, cb, id);
        });
    };
};

exports.postOne = function(mongo, id, newComment) {
    return function(cb) {
        mongo
            .db('blog')
            .collection('posts')
            .update({
                "_id": new ObjectID(id)
            }, {
                "$push": {
                    "comments": newComment
                }
            }, function(err, res) {
                if (err) {
                    return cb(exception(exception.DBError, err.message));
                }
                if (!res) {
                    return cb(exception(exception.NotFound, 'NotFound ' + id));
                }
                cb(null, res);
            });
    };
};

exports.getEdit = function(mongo, id, name) {
    return function(cb) {
        mongo
            .db('blog')
            .collection('posts')
            .findOne({
                "_id": new ObjectID(id),
                "name": name
            }, function(err, doc) {
                if (err) {
                    return cb(exception(exception.DBError, err.message));
                }
                if (!doc) {
                    return cb(exception(exception.NotFound, 'NotFound ' + id));
                }
                cb(null, doc);
            });
    };
};

exports.postEdit = function(mongo, id, name, doc) {
    var tags = {};
    doc.tags.forEach(function(tag) {
        if (tag) {
            tags[tag.toLowerCase()] = 1;
        }
    });
    doc.tags = Object.keys(tags);
    return function(cb) {
        mongo
            .db('blog')
            .collection('posts')
            .update({
                "_id": new ObjectID(id),
                "name": name
            }, {
                "$set": doc
            }, function(err, res) {
                if (err) {
                    return cb(exception(exception.DBError, err.message));
                }
                if (!res) {
                    return cb(exception(exception.NotFound, 'NotFound ' + id));
                }
                cb(null, res);
            });
    };
};

exports.getDelete = function(mongo, id, name) {
    return function(cb) {
        mongo
            .db('blog')
            .collection('posts')
            .remove({
                "_id": new ObjectID(id),
                "name": name
            }, function(err, res) {
                if (err) {
                    return cb(exception(exception.DBError, err.message));
                }
                if (!res) {
                    return cb(exception(exception.NotFound, 'NotFound ' + id));
                }
                cb(null, res);
            });
    };
};

exports.getReprint = function(mongo, id, currentUser) {
    return function(cb) {
        mongo
            .db('blog')
            .collection('posts')
            .findAndModify({
                "_id": new ObjectID(id)
            }, [], {
                "$inc": {
                    reprint_num: 1
                }
            }, {
                new: true
            }, function(err, doc) {
                if (err) {
                    return cb(exception(exception.DBError, err.message));
                }
                if (!doc) {
                    return cb(exception(exception.NotFound, 'NotFound ' + id));
                }

                delete doc._id;

                doc.reprint_id = id;
                doc.reprint_num = 0;
                doc.title = doc.title.match(/^\[转\]/) ? doc.title : "[转]" + doc.title;
                doc.name = currentUser.name;
                doc.avatar = currentUser.avatar;
                doc.time = Date.now();
                doc.comments = [];
                doc.pv = 0;

                mongo
                    .db('blog')
                    .collection('posts')
                    .insert(doc, function(err, res) {
                        if (err) {
                            return cb(exception(exception.DBError, err.message));
                        }
                        cb(null, res);
                    });
            });
    };
};

// 处理从数据库中获取到的数据 列表
var handlePosts = function(err, posts, cb) {
    // 处理错误
    if (err) {
        return cb(exception(exception.DBError, err.message));
    }
    var ps = posts || [];
    ps.map(function(p) {
        p.content = marked(p.content) || '';
        p.time = moment(p.time).format('YYYY-MM-DD HH:mm');
    });
    cb(null, ps);
}

// 单个文章
var handlePost = function(err, post, cb, id) {
    if (err) {
        return cb(exception(exception.DBError, err.message));
    }
    if (!post) {
        return cb(exception(exception.NotFound, 'NotFound ' + id));
    }
    var p = post.value;
    p.content = marked(p.content || '');
    p.time = moment(p.time).format('YYYY-MM-DD HH:mm');
    cb(null, p);
}

var getMongo = function(mongo) {
    return mongoTp(mongo, 'posts');
}
