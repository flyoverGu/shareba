var qiniu = require('qiniu');
var fs = require('fs');

qiniu.conf.ACCESS_KEY = 'c269oxiOdVBEci5mdKRH_tHQJBI20Qni9Cd-1FMh';
qiniu.conf.SECRET_KEY = '0eK1N65G3mRJC5BvI-hqshIKOllTLlYdQ_zxz9vZ';

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

function uploadFile(localFile, key, uptoken) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;

    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if (!err) {
            // 上传成功， 处理返回值
            console.log(ret.key, ret.hash);
            // ret.key & ret.hash
        } else {
            // 上传失败， 处理返回代码
            console.log(err);
            // http://developer.qiniu.com/docs/v6/api/reference/codes.html
        }
    });
}

var token = uptoken('flyover');
console.log(token);
//var file = fs.readFileSync('/Users/flyover/Pictures/avatar.jpg');

uploadFile('/Users/flyover/Pictures/avatar.jpg', '123', token);



