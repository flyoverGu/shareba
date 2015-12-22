'use strict';
var route = require('koa-route');
var db = require('../spider/db');
var _ = require('underscore');
var upload = require('../service/upload');

module.exports = function(app) {
    app.use(route.get('/api/upload/token', function*() {
        this.body = {
            token: upload(),
            code: 1
        };
    }));
    app.use(route.get('/pic', function*() {
        yield this.render('pic');
    }));
    app.use(route.get('/movie', function*() {
        const movie = db.getData();

        // 统计各站分数
        let t = {};
        _.map(movie, (item, index) => {
            item.map((m) => {
                t[m.title] = _.extend(t[m.title] || {}, {
                    title: m.title,
                    [index + 'Score']: m.score || 0,
                });

                if (index === 'douban') {
                    t[m.title] = _.extend(t[m.title], {
                        count: m.count,
                        imgUrl: m.imgUrl
                    });
                }
            });
        });

        let result = [];
        _.map(t, (item, index) => {
            // 拿豆瓣当准则
            if (!item.doubanScore) return;
            const dbP = getPercent(item.count);
            item['allScore'] = Math.round((dbP * item.doubanScore + getPartScore(1 - dbP, item.taobaoScore, item.meituanScore)) * 10) / 10;
            result.push(item);
        });

        // sort
        result.sort(function(a, b) {
            return b.allScore - a.allScore;
        });

        this.body = JSON.stringify(result);

        yield this.render('movie', {
            movie: result
        });
    }));
}

let getPercent = (count) => {
    if (count > 50000) return 1;
    return 0.3 + (0.5 / 50000) * count;
}

let getPartScore = (p, s1, s2) => {
    s1 = s1 || 0;
    s2 = s2 || 0;
    s1 *= p;
    s2 *= p;
    if (s1 && s2) {
        return (s1 + s2) / 2;
    } else {
        return s1 + s2;
    }
}
