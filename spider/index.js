var co = require('co');
var movie = require('./movie');
var Post = require('../dao/post');
var config = require('../config.json');
var mongo = require('koa-mongo');

var conf = {}
Object.assign(conf, config.mongo, {fuckMongo: true});

co(function* () {
    let m = yield mongo(conf);
    let data = yield movie();

    yield Post.save(m, {id: 'admin'}, data);
}).catch(function(err) {
    console.log(err);
})
