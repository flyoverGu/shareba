var co = require('co');
var movie = require('./movie');
var Post = require('../dao/post');
var config = require('../config.json');
var mongo = require('koa-mongo');


co(mongo(config.mongo)).then(function() {
    console.log(11);
    console.log(this);
});

//co(movie).then(function(movie) {
//    console.log(movie);
//})
