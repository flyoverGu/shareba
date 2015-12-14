'use strict';


let http = require('superagent');
let $ = require('cheerio');
let co = require('co');
let db = require('./db');

// 网络获取
let getServerMovie = (url, parse) => new Promise((resolve, reject) =>
    http.get(url).end((err, res) => err ? reject(err) : resolve(parse(res.text)))
);

// 定义解析器
// 豆瓣电影解析器
let parseDoubanMovie = (html) => {
    console.log('开始解析html');
    const $el = $.load(html, {
        decodeEntities: false
    });
    const $list = $el('#nowplaying ul.lists>li');
    // FIXME
    let res = [];
    $list.map((index, li) => {
        res.push({
            id: 'douban',
            title: $(li).data('title'),
            count: $(li).data('votecount'),
            score: $(li).data('score'),
            doubanUrl: $(li).find('.ticket-btn').attr('href'),
            imgUrl: $(li).find('img').attr('src')
        });
    });
    return res
}

let start = (list, ser, cb) => {
    co(function*() {
        return yield list.map((item) => ser(item.url, item.parse));
    }).then((val) => cb(null, val), (err) => cb(err));
}

let handleData = (val) => {
    // FIXME db是从外面引入
    db.saveData(val);
}

let thinkF = (list, ser) => (cb) => start(list, ser, cb);


// 对外启动接口
module.exports = () => thinkF([{
    url: 'http://movie.douban.com/nowplaying/hangzhou/',
    parse: parseDoubanMovie
}], getServerMovie)((err, val) => handleData(val));
