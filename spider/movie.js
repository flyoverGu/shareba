'use strict';

let http = require('superagent');
let $ = require('cheerio');
let co = require('co');
let db = require('./db');
let _ = require('underscore');

// 网络获取
let getServerMovie = (url, parse) => new Promise((resolve, reject) =>
    http.get(url).set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36').set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8').end((err, res) => err ? reject(err) : resolve(parse(res.text)))
);

// 定义解析器
// 豆瓣电影解析器
let parseDoubanMovie = (html) => {
    return commonParse(html, '#nowplaying ul.lists>li', (el, res) => res.push({
        title: $(el).data('title'),
        count: $(el).data('votecount'),
        score: $(el).data('score'),
        doubanUrl: $(el).find('.ticket-btn').attr('href'),
        imgUrl: $(el).find('img').attr('src')
    }));
}

// 美团解析器
let parseMeituanMovie = (html) => {
    return commonParse(html, '.movies-container .movie-cell', (el, res) => res.push({
        title: $(el).find('.movie-cell__cover').attr('title'),
        score: parseInt($(el).find('.rate-stars').attr('style').replace('width:', '')) / 10
    }));
}

let parseTaobaoMoive = (html) => {
    // TODO 这里选择器有问题，有重复数据
    return commonParse(html, '.center-wrap .tab-content>.tab-movie-list .movie-card-wrap', (el, res) => {
        res.push({
            title: $(el).find('.movie-card-name .bt-l')[0].children[0].data,
            score: $(el).find('.movie-card-name .bt-r').html()
        })
    });
}

let commonParse = (html, selector, dataFun) => {
    console.log('开始解析html');
    const $el = $.load(html, {
        decodeEntities: false
    });
    const $list = $el(selector);
    // FIXME
    let res = [];
    $list.map((index, li) => {
        dataFun(li, res);
    });
    return res
}


let start = (list, ser, cb) => {
    co(function*() {
        return yield _.mapObject(list, (item) => ser(item.url, item.parse));
    }).then((val) => cb(null, val), (err) => cb(err));
}

let handleData = (val) => {
    // FIXME db是从外面引入
    db.saveData(val);
}

let thinkF = (list, ser) => (cb) => start(list, ser, cb);

const spiderList = {
    'taobao': {
        url: 'https://dianying.taobao.com/showList.htm',
        parse: parseTaobaoMoive
    },
    //'douban': {
    //    url: 'http://movie.douban.com/nowplaying/hangzhou/',
    //    parse: parseDoubanMovie
    //},
    //'meituan': {
    //    url: 'http://hz.meituan.com/dianying/zuixindianying',
    //    parse: parseMeituanMovie
    //}
}

// 对外启动接口
module.exports = () => thinkF(spiderList, getServerMovie)((err, val) => handleData(val));
