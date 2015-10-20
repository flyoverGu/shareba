var co = require('co');
var movie = require('./movie');
var Post = require('../dao/post');
var config = require('../config.json');
var mdb = require('../dao/mongodb');

// 爬取间隔时间
let time = 1000 * 60 * 12;


let start = () => {
    co(function*() {
        

        let m =
            yield mdb(config.mongo);

        let data =
            yield movie();

        let res =
            yield Post.search(m, data.title);

        console.log(res);
        // 避免重复查询
        if (res && res.length) {} else {
            yield Post.save(m, {
                id: 'admin'
            }, data);
        }
    }).catch(function(err) {
        console.log(err);
    })
}

setInterval(() => start(), time);
