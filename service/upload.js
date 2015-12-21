var qiniu = require('qiniu');
var qnConf= require('../config.json').qiniu;

qiniu.conf.ACCESS_KEY = qnConf.ak;
qiniu.conf.SECRET_KEY = qnConf.sk;

function uptoken(bucketname) {
    var putPolicy = new qiniu.rs.PutPolicy(bucketname);
    //putPolicy.callbackUrl = callbackUrl;
    //putPolicy.callbackBody = callbackBody;
    //putPolicy.returnUrl = returnUrl;
    //putPolicy.returnBody = returnBody;
    //putPolicy.asyncOps = asyncOps;
    //putPolicy.expires = expires;
    return putPolicy.token();
}

module.exports = () => uptoken('flyover');





