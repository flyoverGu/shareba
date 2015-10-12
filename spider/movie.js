
let http = require('superagent');
let $ = require('cheerio');
let htmlToText = require('html-to-text');


let baseUrl = 'http://www.weixinyidu.com'; // 毒舌电影

let getMovieList = () => {
    let url = baseUrl + '/a_2851'; 
    http.get(url).end((err, res) => {
        if (err) {
            console.log('get movie list error :' + err);
        } else {
            let html = res.text;
            let {title, href} = findNewMovie(html);
            console.log(title);
            getMovieContent(href);
        }
    });
}

let getMovieContent = (href) => {
    let url = baseUrl + href;
    http.get(url).end((err, res) => {
        if (err) {
            console.log('get movie content error :' + err);
        } else {
            let html = res.text;
            let content = readMovieContent(html);
            console.log(content);
        }
    });
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
    let content = $el('#page-content').children().html();
    content = htmlToText.fromString(content);
    return content;
}

getMovieList();
