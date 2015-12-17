var route = require('koa-route');
var db = require('../spider/db');
var _ = require('underscore');

module.exports = function(app) {
    app.use(route.get('/movie', function*() {
        const movie = db.getData();

        // 统计各站分数
        let t = {};
        movie['douban'].each(function(i) {
            t[i.title] = t[i.title] || {};
            _.extend(t[i.title], {
                title: i.title,
                dbScore: i.score,
            });
        });

        _.map(movie, (item, index) => {
            item.map((m) => {
                t[m.title] = _.extend(t[m.title] || {}, {
                    title: item.tltle,
                    index + 'Score': item.score
                });
            });
        });

        console.log(t);

        this.body = JSON.stringify(t);

        //yield this.render('movie', {
        //    movie
        //});
    }));
}
