var path = require('path');

var koa = require('koa');
var logger = require('koa-logger');
var mongo = require('koa-mongo');
var session = require('koa-session');
var flash = require('koa-flash');
var bodyparser = require('koa-bodyparser');
var render = require('koa-ejs');
var serve = require('koa-static');

var route = require('./routes/');
var config = require('./config.json');
var exception = require('./lib/exception');

var spider = require('./spider');

var app = koa();
app.keys = config.keys;

render(app, {
  root: path.join(__dirname, 'views'),
  layout: false,
  viewExt: 'ejs'
});

app.use(logger());
app.use(bodyparser());
app.use(session(app));
app.use(flash());
app.use(mongo(config.mongo));
app.use(serve(__dirname + '/public'));

app.use(function* (next) {
  try {
    yield next;
  } catch (err) {
    switch (err.code) {
    case exception.RequestError:
      this.flash = err.message;
      this.redirect('back');
      break;
    case exception.NotFound:
      this.redirect('/404');
      break;
    case exception.DBError:
    case exception.ServerError:
      this.flash = err.message;
      this.redirect('/');
      break;
    default:
      this.flash = err.message;
      this.redirect('/');
    }
  }
});

route(app);

var port = process.env.PORT || config.app;
app.listen(port, function() {
  console.log('listening on port ' + port);
});
