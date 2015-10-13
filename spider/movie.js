
let http = require('superagent');
let $ = require('cheerio');
let htmlToText = require('html-to-text');


let baseUrl = 'http://www.weixinyidu.com'; // 毒舌电影

let getMovieList = () => {
    let url = baseUrl + '/a_2851'; 
    return (cb) => {
        http.get(url).end((err, res) => {
            if (err) {
                console.log('get movie list error :' + err);
                cb(err);
            } else {
                let html = res.text;
                cb(null, findNewMovie(html));
            }
        });
    }
}

let getMovieContent = (href) => {
    let url = baseUrl + href;
    return (cb) => {
        http.get(url).end((err, res) => {
            if (err) {
                console.log('get movie content error :' + err);
                cb(err);
            } else {
                let html = res.text;
                let content = readMovieContent(html);
                cb(null, content);
            }
        });
    }
}

let findNewMovie = (html) => {
    let $el = $.load(html, {decodeEntities: false});
    let li = $el('.news_list .news_content li');
    let title = li.find('.news_title').html();
    let href = li.find('a').attr('href');
    return {title, href}
}

let readMovieContent = (html) => {
    let $el = $.load(html, {decodeEntities: false});
    let content = $el('#page-content').html();
    content = htmlToText.fromString(content);
    return transformUrl(content);
}

let transformUrl = (content) => content.replace(/\[(\S*)\]/gi, (str, $1) => '![](' + $1 + ')');

module.exports = function *() {
    let {title, href}  = yield getMovieList();
    let content = yield getMovieContent(href);   
    return {title, content};
}

