let koa = require('koa');
let bodyparser = require('koa-bodyparser');
let route = require('koa-route');
let sha1 = require('sha1');
let wechatparser = require("co-wechat-parser").middleware;
let xml = require('xml');
let serve = require('koa-static');

let app = koa();

app.use(serve('.'));
app.use(function*(next) {
    try {
        yield next;
    } catch (e) {
        console.log(e);
    }
});
app.use(wechatparser());
app.use(bodyparser());


let api = "/api/v1/";
app.use(route.get(api + "wechat/verify", function*() {
    let {
        signature, timestamp, nonce, echostr
    } = this.query;
    if (verifyWechat(signature, timestamp, nonce)) {
        this.body = echostr;
    } else {
        this.body = "fail";
    }
}));

app.use(route.post(api + 'wechat/verify', function*() {
    let {
        signature, timestamp, nonce, echostr
    } = this.query;
    console.log(this.request.body);
    this.set('Content-Type', 'text/xml');
    this.body = initReplyMessage(this.request.body);
    emitMsg(this.request.body);
}));

let initReplyMessage = (m) => {
    let c = [{
        xml: [{
            ToUserName: m.fromusername
        }, {
            FromUserName: m.tousername
        }, {
            CreateTime: new Date().getTime()
        }, {
            MsgType: 'text'
        }, {
            Content: '你的内容已经上墙了'
        }]
    }];
    return xml(c);
}

let token = "54edc0f2e451765ea087f9fa";
let verifyWechat = (signature, timestamp, nonce) => {
    if (!signature || !timestamp || !nonce) {
        return false;
    }
    var arr = [token, timestamp, nonce];
    arr.sort();
    var str = arr.join('');
    return signature == sha1(str);
}

let port = 8080;
app.listen(port, () => console.log("start !!!"));

// socket
let server = require('http').Server(app.callback());
let io = require('socket.io')(server);

let emitMsg = (msg) => {
    let content = {
        uid: msg.tousername,
        msg: msg.content,
        msgTime: msg.createtime,
        msgTpye: msg.msgtype
    };
    io.emit('msg', content);
}

io.on('connection', (socket) => {
    console.log('connection success');
    socket.on('disconnect', () => console.log("disconnect"));
});

server.listen(8081);
