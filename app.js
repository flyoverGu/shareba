var serve = require('koa-static');
var koa = require('koa');
var app = koa();

// logger

app.use(function*(next) {
    var start = new Date;
    yield next;
    var ms = new Date - start;
    console.log('%s %s - %s', this.method, this.url, ms);
});

// response

// public 
app.use(serve('public'));

app.listen(8080);
