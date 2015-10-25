/*global WSDK, console, $*/

(function() {
    'use strict';

    var sdk = new WSDK(),
        appKey = '23257991',
        uid = 'billyct',
        credential = '3f09678bb444789819a67df200acf786',
        i = 0,
        userMsgMap = {},
        messages;

    sdk.Base.login({
        uid: uid,
        appkey: appKey,
        credential: credential,
        timeout: 4000,
        success: function(data) {
            // {code: 1000, resultText: 'SUCCESS'}
            console.log('login success', data);
            sdk.Event.on('MSG_RECEIVED', function(data) {
                console.log(data);

                messages = [];

                if (data.data.data !== undefined) {

                    data = data.data.data;

                    for (i = 0; i < data.messages.length; i++) {

                        if (data.messages[i].msgType <= 2) {
                            //代表用户发消息过来.图片，和文字
                            messages.push({
                                msg: data.messages[i].msgContent[0][1],
                                time: data.messages[i].msgSendTime * 1000,
                                uid: data.messages[i].fromId,
                                id: uuid()
                            });
                        } else {
                            messages.push({
                                msg: data.messages[i].msgContent.customize,
                                time: data.messages[i].msgSendTime * 1000,
                                uid: data.messages[i].fromId,
                                id: uuid(),
                                type: 'custom'
                            });
                        }

                        //=3 是有人加入进来 //msg content是用户加入群
                    }
                }

                if (data.data !== undefined) {

                    data = data.data;

                    for (i = 0; i < data.msgs.length; i++) {

                        //代表用户发消息过来.图片，和文字
                        messages.push({
                            value: data.msgs[i].msg.customize,
                            time: data.msgs[i].time,
                            uid: data.msgs[i].from,
                            id: uuid(),
                            type: data.msgs[i].msg.header.summary
                        });

                        //=3 是有人加入进来 //msg content是用户加入群
                    }
                }

                messages.map(function(m) {
                    if (m.type == "shake" || m.type == "blow") {
                        m.parentId = userMsgMap[m.uid];
                    } else if (m.type) {
                        userMsgMap[m.uid] = m.id;
                    }
                    BarragesWillSent.push(m);
                });

                console.log(userMsgMap);
                console.log(messages);
            });

            sdk.Base.startListenAllMsg();
        },
        error: function(error) {
            // {code: 1002, resultText: 'TIMEOUT'}
            console.log('login fail', error);
        }
    });


}());

function uuid(a, b) {
    for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
    return b
};
