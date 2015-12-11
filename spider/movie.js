'use strict';


let http = require('superagent');
let $ = require('cheerio');
let co = require('co');

// 网络获取
let getServerMovie = (url, parse) => new Promise((resolve, reject) =>
    http.get(url).end((err, res) => err ? reject(err) : resolve(parse(res.text)))
);

// 豆瓣电影解析器
let parseDoubanMovie = (html) => {
    const $el = $.load(html, {
        decodeEntities: false
    });
    const $list = $el('#nowplaying ul.lists>li');
    const res = $list.map((index, li) => {
        return li.attribs;
    });
    return res
}

let start = (list, ser) => {
    co(function*() {
        return yield list.map((item) => ser(item.url, item.parse));
    }).then((val) => console.log(val), (err) => console.log(err.stack));
}

start([{
    url: 'http://movie.douban.com/nowplaying/hangzhou/',
    parse: parseDoubanMovie
}], getServerMovie);
