let movie = require('./movie');
// 爬取间隔时间
let time = 1000 * 60 * 12;

let start = () => {
    // 获取电影
    movie(function(err, val) {
        console.log(err, val);
    });
}

setInterval(() => start(), time);
