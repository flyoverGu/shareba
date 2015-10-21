var Post = require('../dao/post');

module.exports = {
    pagePosts: function* () {
        var page = this.query.p ? parseInt(this.query.p) : 1;
        var posts =
            yield Post.getTen(this.mongo, null, page);
        var total =
            yield Post.count(this.mongo);

        yield this.render('index', {
            title: '主页',
            posts: posts,
            page: page,
            user: this.session.user,
            isFirstPage: (page - 1) === 0,
            isLastPage: ((page - 1) * 10 + posts.length) === total,
            flash: this.flash
        });
    }
}
