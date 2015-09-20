var User = require('../models/user');
var md5 = require('../lib/md5');
var udb = require('../dao/user');

module.exports = {

    reg: function*() {
        var body = this.request.body;

        var newUser = new User({
            name: body.name,
            password: md5(body.password),
            email: body.email
        });

        yield udb.save(this.mongo, newUser);
        this.response.body = "reg success";
    },

    login: function* () {
           
        var body = this.request.body;
        var name = body.name;
        var password = body.password;

        var user =
            yield udb.get(this.mongo, name);

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
    }
}
