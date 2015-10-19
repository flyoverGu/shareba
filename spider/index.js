var co = require('co');
var movie = require('./movie');
var Post = require('../dao/post');
var config = require('../config.json');
var mongo = require('koa-mongo');

co(function* () {
    yield mongo(config)(function *() {
        console.log(this);
    });
    let data = yield movie();
    let res = yield Post.search(m, data.title);
    if (res && res.length) {
    } else {
        yield Post.save(m, {id: 'admin'}, data);
    }

}).catch(function(err) {
    console.log(err);
})
