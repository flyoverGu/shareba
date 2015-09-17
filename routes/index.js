var gravatar = require('gravatar');
var moment = require('moment');
var route = require('koa-route');

var User = require('../models/user');
var Post = require('../models/post');
var exception = require('../lib/exception');
var md5 = require('../lib/md5');

module.exports = function (app) {
  app.use(route.get('/', function* () {
    var page = this.query.p ? parseInt(this.query.p) : 1;
    var posts = yield Post.getTen(this.mongo, null, page);
    var total = yield Post.count(this.mongo);

    yield this.render('index', {
      title: '主页',
      posts: posts,
      page: page,
      user: this.session.user,
      isFirstPage: (page - 1) === 0,
      isLastPage: ((page - 1) * 10 + posts.length) === total,
      flash: this.flash
    });
  }));

  app.use(route.post('/login', checkNotLogin));
  app.use(route.post('/login', function* () {
    var name = this.request.body.name;
    var password = this.request.body.password;

    var user = yield User.get(this.mongo, name);

    if (!user) {
      throw exception(exception.RequestError, '用户不存在!');
    }

    if (user.password != md5(password)) {
      throw exception(exception.RequestError, '密码错误!');
    }

    delete user.password;
    this.session.user = user;
    this.flash = '登录成功!';
    this.redirect('/');
  }));

  app.use(route.get('/post', checkLogin));
  app.use(route.get('/post', function* () {
    yield this.render('post', {
      title: '发表',
      user: this.session.user,
      flash: this.flash
    });
  }));

  app.use(route.post('/post', checkLogin));
  app.use(route.post('/post', function* () {
    yield Post.save(this.mongo, this.session.user, this.request.body);

    this.flash = '发布成功!';
    this.redirect('/');
  }));

  app.use(route.get('/logout', checkLogin));
  app.use(route.get('/logout', function* () {
    this.session.user = null;
    this.flash = '登出成功!';
    this.redirect('/');
  }));

  app.use(route.get('/archive', function* () {
    var posts = yield Post.getArchive(this.mongo);

    yield this.render('archive', {
      title: '存档',
      posts: posts,
      user: this.session.user,
      flash: this.flash
    });
  }));

  app.use(route.get('/tags', function* () {
    var posts = yield Post.getTags(this.mongo);

    yield this.render('tags', {
      title: '标签',
      posts: posts,
      user: this.session.user,
      flash: this.flash
    });
  }));

  app.use(route.get('/tags/:tag', function* (tag) {
    var posts = yield Post.getTag(this.mongo, tag);

    yield this.render('index', {
      posts: posts,
      user: this.session.user,
      flash: this.flash
    });
  }));

  app.use(route.get('/links', function* () {
    yield this.render('links', {
      title: '友情链接',
      user: this.session.user,
      flash: this.flash
    });
  }));

  app.use(route.get('/search', function* () {
    var keyword = this.query.keyword;
    var posts = yield Post.search(this.mongo, keyword);

    yield this.render('search', {
      title: "SEARCH:" + keyword,
      posts: posts,
      user: this.session.user,
      flash: this.flash
    });
  }));

  app.use(route.get('/u/:name', function* (name) {
    var page = this.query.p ? parseInt(this.query.p) : 1;
    var posts = yield Post.getTen(this.mongo, name, page);
    var total = yield Post.count(this.mongo, name);

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

  app.use(route.get('/p/:id', function* (id) {
    var post = yield Post.getOne(this.mongo, id);

    yield this.render('article', {
      title: post.title,
      post: post,
      user: this.session.user,
      flash: this.flash
    });
  }));

  app.use(route.get('/edit/:id/', checkLogin));
  app.use(route.get('/edit/:id/', function* (id, next) {
    var currentUser = this.session.user;
    var post = yield Post.getEdit(this.mongo, id, currentUser.name);

    yield this.render('edit', {
      title: '编辑',
      post: post,
      user: this.session.user,
      flash: this.flash
    });
  }));

  app.use(route.post('/edit/:id', checkLogin));
  app.use(route.post('/edit/:id', function* (id) {
    var currentUser = this.session.user;
    yield Post.postEdit(this.mongo, id, currentUser.name, this.request.body);

    this.flash = '修改成功!';
    this.redirect('/p/' + id);
  }));

  app.use(route.get('/delete/:id', checkLogin));
  app.use(route.get('/delete/:id', function* (id) {
    var currentUser = this.session.user;
    yield Post.getDelete(this.mongo, id, currentUser.name);

    this.flash = '删除成功!';
    this.redirect('/');
  }));

  app.use(route.get('/reprint/:id', checkLogin));
  app.use(route.get('/reprint/:id', function* (id) {
    var currentUser = this.session.user;
    yield Post.getReprint(this.mongo, id, currentUser);

    this.flash = '转载成功!';
    this.redirect('/');
  }));

  app.use(function* () {
    yield this.render('404');
  });
};

function* checkLogin () {
  if (!this.session.user) {
    this.flash = '未登录!'; 
    this.redirect('/login');
  }
  yield arguments[arguments.length - 1];
}

function* checkNotLogin () {
  if (this.session.user) {
    this.flash = '已登录!'; 
    this.redirect('back');
  }
  yield arguments[arguments.length - 1];
}
