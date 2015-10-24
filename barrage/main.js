/*global WSDK, console, $*/

(function () {
  'use strict';

  var sdk = new WSDK(),
    appKey = '23257993',
    uid = 'billyct',
    credential = '3f09678bb444789819a67df200acf786',
    i = 0,
    messages;

  sdk.Base.login({
    uid: uid,
    appkey: appKey,
    credential: credential,
    timeout: 4000,
    success: function (data) {
      // {code: 1000, resultText: 'SUCCESS'}
      console.log('login success', data);
      sdk.Event.on('MSG_RECEIVED', function (data) {
        data = data.data.data;
        messages = [];
        for (i = 0; i < data.messages.length; i++) {

          if (data.messages[i].msgType <= 2) {
            //代表用户发消息过来.图片，和文字
            messages.push({
              msg: data.messages[i].msgContent[0][1],
              time: data.messages[i].msgSendTime * 1000,
              id: data.messages[i].fromId
            });
          }

          //=3 是有人加入进来 //msg content是用户加入群
        }

        console.log(messages);
        messages.map(function(m) {
            BarragesWillSent.push(m);
        });
      });

      sdk.Base.startListenAllMsg();
    },
    error: function (error) {
      // {code: 1002, resultText: 'TIMEOUT'}
      console.log('login fail', error);
    }
  });


}());

