var gravatar = require('gravatar');
var moment = require('moment');
var route = require('koa-route');

var exception = require('../lib/exception');
var md5 = require('../lib/md5');

var user = require('./user');
var post = require('./post');

module.exports = function(app) {
    app.use(route.get('/', post.pagePosts));

    app.use(route.post('/reg', user.reg));
    app.use(route.post('/login', user.login));
    app.use(route.get('/logout', checkLogin));
    app.use(route.get('/logout', user.logout));

    app.use(route.get('/post', checkLogin));
    app.use(route.get('/post', function*() {
        yield this.render('post', {
            title: '发表',
            user: this.session.user,
            flash: this.flash
        });
    }));

    app.use(route.post('/post', checkLogin));

    app.use(route.get('/tags/:tag', function*(tag) {
        var posts =
            yield Post.getTag(this.mongo, tag);

        yield this.render('index', {
            posts: posts,
            user: this.session.user,
            flash: this.flash
        });
    }));

    app.use(route.get('/search', function*() {
        var keyword = this.query.keyword;
        var posts =
            yield Post.search(this.mongo, keyword);

        yield this.render('search', {
            title: "SEARCH:" + keyword,
            posts: posts,
            user: this.session.user,
            flash: this.flash
        });
    }));

    app.use(route.get('/u/:name', function*(name) {
        var page = this.query.p ? parseInt(this.query.p) : 1;
        var posts =
            yield Post.getTen(this.mongo, name, page);
        var total =
            yield Post.count(this.mongo, name);

        yield this.render('user', {
            title: name,
            posts: posts,
            page: page,
            user: this.session.user,
            isFirstPage: (page - 1) == 0,
            isLastPage: ((page - 1) * 10 + posts.length) == total,
            flash: this.flash
        });
    }));

    app.use(route.get('/p/:id', function*(id) {
        var post =
            yield Post.getOne(this.mongo, id);

        yield this.render('article', {
            title: post.title,
            post: post,
            user: this.session.user,
            flash: this.flash
        });
    }));

    app.use(function*() {
        yield this.render('404');
    });
};

function* checkLogin() {
    if (!this.session.user) {
        this.flash = '未登录!';
        this.redirect('/login');
    }
    yield arguments[arguments.length - 1];
}

function* checkNotLogin() {
    if (this.session.user) {
        this.flash = '已登录!';
        this.redirect('back');
    }
    yield arguments[arguments.length - 1];
}
