var route = require('koa-route');
var db = require('../spider/db');

module.exports = function(app) {
    app.use(route.get('/movie', function*() {
        const movie = db.getData();
        yield this.render('movie', {
            movie
        });
    }));
}
