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
            //getBarrage();
            //return;
            //get barrage;
            setTimeout(function() {
                handleBarrage()
            }, 200);
            return;
        }
        if(!prevBarrage) prevBarrage = current; //首次弹幕

        window.setTimeout(function(){
            //这里会有浏览器最短间隔时间限制; 无法同时发送弹幕
            sendBarrage(current);

            BarragesSent.push(current); //塞入已发送队列

            prevBarrage = current;
            handleBarrage(); //执行下次弹幕发送
        }, current.time - prevBarrage.time);


    }

    function sendBarrage(barrage){
        //发送弹幕
        var textDom = document.createElement('span');
        textDom.className = barrageClass;
        textDom.innerText = barrage.msg;

        textDom.addEventListener('transitionend', function(){
            //真是个好事件
            this.remove();
        });


        //弹幕重叠检测
        var judge = judgeDot();

        if(judge.empty){
            textDom.style.top = (judge.y - 12) + 'px';
        } else {
            textDom.style.top = judge.y + 'px';
            textDom.style.left = judge.x + 'px';
        }

        //textDom.style.fontSize = 46*Math.random()+'px';
        mask.appendChild(textDom);

        //宽高需要被渲染
        var _width = parseInt(window.getComputedStyle(textDom).width, 10),
            _left = parseInt(window.getComputedStyle(textDom).left, 10);
        textDom.style.transitionDuration = (_width+_left)/70 +'s';
        textDom.style.left = '-'+_width+'px';
    }

    function judgeDot(){
        var barrages = document.getElementsByClassName(barrageClass);
        var dotX = window.innerWidth,
            dotY = 96;
        var tempX = Infinity,
            tempY = 0;
        var tarDom;

        //初始化检测点
        var obj = resetDot();

        for(var i = 0, l = barrages.length; i < l;i++){
            var now = barrages[i];
            var left = parseInt(window.getComputedStyle(now).left, 10),
                top = parseInt(window.getComputedStyle(now).top, 10),
                width = parseInt(window.getComputedStyle(now).width, 10),
                height = parseInt(window.getComputedStyle(now).height, 10);

            var curX = left + width,
                curY = top + height;

            //弹幕已经完全进入视窗
            if(curX < dotX) continue;

            for(var k = 0; k < obj.length; k++){
                //判断点是否相交
                var _obj_ = obj[k];
                if(_obj_.empty){
                    if(top < _obj_.y && curY > _obj_.y) _obj_.empty = false;
                }
            }

            if(curX > dotX && curX < tempX){
                //即将全部进入视窗的弹幕横坐标
                tempX = curX;
                tarDom = now;
            }
        }


        for(var i=0;i<obj.length;i++){
            if(!obj[i].empty){
                continue;
            } else {
                return obj[i];
            }
        }
        //全部覆盖
        return {
            x: tempX,
            y: parseInt(window.getComputedStyle(tarDom).top)

        };

        function resetDot(){
            //监测点初始化
            var obj = [];
            for(var j = 0; j < 6; j++){
                obj.push({
                    x: dotX,
                    y: 12 + j*24, //先写死
                    empty: true
                })
            }

            return obj;
        }
    }

    function init(){

        //create mask
        createMask();
        handleBarrage();
        //getBarrage();
        //get barrage

        //correct time

        //if(left barrage)
        //send barrage
        //else(get barrage)
        //end
    }

})();
