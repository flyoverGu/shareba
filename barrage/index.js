/**
 * Created by Gqb on 15/10/24.
 */
(function(){
    var BarragesSent = []; //已处理队列
    window.BarragesWillSent = []; //待处理队列

    var prevBarrage; //纪录上一份弹幕

    var mask;

    var barrageClass = '_my_barrage_',
        maskId = '_my_barrage_mask_';

    var zIndex = 1,
        fontSize = 24,
        barrageLines = 10;

    var getStyle = window.getComputedStyle;

    if(window.onload && typeof window.onload === 'function'){
        //处理页面中原有的dom ready逻辑
        var oldLoad = window.onload;

        window.onload = function(){
            oldLoad();
            init();
        }
    }else{
        window.onload = function(){
            init();
        }
    }

    function createMask(){
        //创建弹幕浮层
        mask = document.createElement('div');
        mask.id = maskId;
        document.body.appendChild(mask);
    }

    function getBarrage(){
        prevBarrage = null;
        if (!window.fetch){

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function(){
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
                    afterGet(JSON.parse(xmlhttp.responseText));
                }
            };
            xmlhttp.open("GET","./test-barrage.json",true);
            xmlhttp.send();

        }else{
            //获取弹幕
            window.fetch('./test-barrage.json').then(function(res){
                return res.json()
            }).then(function(json){
                //存入待处理队列
                console.log(json);
                afterGet(json);
            })
        }

        function afterGet(resBarrage){
            BarragesWillSent = BarragesWillSent.concat(resBarrage.barrages);
            handleBarrage();
        }
    }

    function handleBarrage(){
        //处理当前队列中的弹幕
        var current = BarragesWillSent.shift(); //从待发送队列取出

        if(!current) {
            window.setTimeout(function(){
                handleBarrage();
            }, 200);
            return;
            //get barrage;
        }
        if(!prevBarrage) prevBarrage = current; //首次弹幕

        window.setTimeout(function(){
            //做个是否有位置放置弹幕的判断
            if(sendBarrage(current)){

                BarragesSent.push(current); //塞入已发送队列

                prevBarrage = current;

            } else {
                //没有位置，先塞回待发布列表
                BarragesWillSent.unshift(current);
            }
            handleBarrage(); //执行下次弹幕发送
        }, 0);


    }

    function sendBarrage(barrage){

        if(updateBarrage(barrage)) return true;

        //发送弹幕
        var textDom = document.createElement('span');

        //弹幕重叠检测
        var judge = judgeDot();

        if(judge.empty){
            textDom.style.top = (judge.y - fontSize/2) + 'px';
        } else {
            return false;
        }

        textDom.id = barrage.id;
        textDom.className = barrageClass;
        textDom.innerText = barrage.msg;
        textDom.style.fontSize = fontSize + 'px';
        textDom.style.left = (window.innerWidth)+'px';

        mask.appendChild(textDom);

        return true;
    }

    function updateBarrage(barrage){
        //特殊弹幕处理
        var tar;
        if(barrage.msg == 'fast'){
            tar = document.getElementById(barrage.parentId);
            if(tar){
                if(barrage.speed == 1){
                    tar.style.color = '#fff';
                    tar.style.zIndex = 0;
                } else {
                    tar.style.color = '#f00';
                    tar.style.zIndex = (zIndex++);
                }
                tar.setAttribute('data-speed', barrage.speed);
            }
            return true;
        }
        return false;
    }

    function judgeDot(){
        var barrages = document.getElementsByClassName(barrageClass);
        var dotX = window.innerWidth;

        //初始化检测点
        var obj = resetDot();

        for(var i = 0, l = barrages.length; i < l;i++){
            var now = barrages[i];
            var left = parseInt(getStyle(now).left, 10),
                top = parseInt(getStyle(now).top, 10),
                width = parseInt(getStyle(now).width, 10),
                height = parseInt(getStyle(now).height, 10);

            var curX = left + width,
                curY = top + height;

            //弹幕已经完全进入视窗
            if(curX < dotX) continue;

            for(var k = 0; k < obj.length; k++){
                //逐一判断点是否相交
                var _obj_ = obj[k];
                if(_obj_.empty){
                    if(top < _obj_.y && curY > _obj_.y) _obj_.empty = false;
                }
            }
        }

        for(var j = 0; j < obj.length; j++) {
            if (obj[j].empty)
                return obj[j];
        }

        //无可放置区域
        return false;

        function resetDot(){
            //监测点初始化
            var obj = [];
            for(var j = 0; j < barrageLines; j++){
                obj.push({
                    x: dotX,
                    y: fontSize/2 + j*fontSize,
                    empty: true
                })
            }

            return obj;
        }
    }

    function moveBarrage(){
        var barrages = document.getElementsByClassName(barrageClass);

        var tempLeft = [];
        var temp;
        for(var i=0;i<barrages.length;i++){

            temp = {
                dom: barrages[i],
                width: parseFloat(getStyle(barrages[i]).width),
                left: parseFloat(getStyle(barrages[i]).left),
                speed: parseFloat(barrages[i].getAttribute('data-speed')) || 1
            };
            tempLeft.push(temp);

        }
        for(var i=0;i<tempLeft.length;i++){

            temp = tempLeft[i];
            if(temp.width + temp.left < 0){
                temp.dom.remove();
                continue;
            }
            temp.dom.style.left = (temp.left-temp.speed) + 'px';
        }
        requestAnimationFrame(moveBarrage);
    }

    function init(){

        createMask();
        //getBarrage();
        handleBarrage();
        requestAnimationFrame(moveBarrage);

    }

})();