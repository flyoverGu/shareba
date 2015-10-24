let koa = require('koa');
let bodyparser = require('koa-bodyparser');
let route = require('koa-route');

let app = koa();
app.use(bodyparser());


app.use(function* (next)  {
    try {
        yield next;
    } catch(e) {
        console.log(e);
    }
});

let api = "/api/v1/";
app.use(route.get(api + "wechat/verify", function*() {
    console.log(this.query);
}));

let port = 8080;
app.listen(port, ()=> console.log("start !!!"));

