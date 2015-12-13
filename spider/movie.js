'use strict';


let http = require('superagent');
let $ = require('cheerio');
let co = require('co');
let db = require('./db');

// 网络获取
let getServerMovie = (url, parse) => new Promise((resolve, reject) =>
    http.get(url).end((err, res) => err ? reject(err) : resolve(parse(res.text)))
);

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
            title: $(li).data('title'),
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

let thinkF = (list, ser) => (cb) => start(list, ser, cb);

thinkF([{
    url: 'http://movie.douban.com/nowplaying/hangzhou/',
    parse: parseDoubanMovie
}], getServerMovie)((err, val) => db.saveData(val));
