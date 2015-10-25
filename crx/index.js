(function() {
    var el = document.createElement('iframe');
    var div = document.createElement('div');
    var hwDiv = document.createElement('div');
    hwDiv.id = 'hw-div';
    var warp = document.createElement('div');
    el.src = "http://letshareba.com";
    warp.appendChild(el);
    warp.appendChild(div);
    warp.appendChild(hwDiv);
    document.body.appendChild(warp);

    $(el).css({
        height: '100%',
        width: '100%'
    });
    $(warp).css({
        position: "fixed",
        top: 0,
        'z-index': 99999,
        border: 'solid 1px #666',
        'box-shadow': '2px 4px 14px'
    });
    $(div).css({
        position: 'absolute',
        top: 0,
        height: '100%',
        width: '100%' 
    });
    $(hwDiv).css({
        position: 'absolute',
        height: '8px',
        width: '8px',
        bottom: 0,
        right: 0,
        'background-color': '#000'
    });

    listenEvent(warp);

    function listenEvent(el) {
        var $el = $(el);
        var $hw = $(hwDiv);

        // 移动整个框
        $el.on('mousedown.tt',':not(#hw-div)', function(e) {
            var start = {
                x: e.offsetX,
                y: e.offsetY
            }
            $el.on('mousemove.tt', function(e) {
                var current = {
                    x: e.clientX,
                    y: e.clientY
                }
                moveIframe(start, current, $el);
            })
        }).on('mouseup', function(e) {
            $el.off('mousemove.tt');
        });
        $('body').on('mouseup', function(e) {
            $el.off('mousemove.tt');
        });


        //边宽高
        $hw.on('mousedown.hw', function(e) {
            $('body').on('mousemove.hw', function(e) {
                var pos = {
                    x: e.clientX,
                    y: e.clientY
                }
                changeHw(pos, $el);

            }); 
        }).on('mouseup', function(e) {
            $('body').off('mousemove.hw');
        });
        $('body').on('mouseup', function(e) {
            $el.off('mousemove.hw');
        });
    }

    function moveIframe(start, current, $el) {
        var top = current.y - start.y;
        var left = current.x - start.x;
        $el.css({
            top: top,
            left: left 
        });
    }

    function parseString(css) {
        var px = parseInt(css.slice(0, -2));
        if (isNaN(px)) {
            return 0;
        } else {
            return px;
        }
    }

    function changeHw(current, $el) {
        var offset = $el.position();
        var h = current.y - offset.top;
        var w = current.x - offset.left;
        $el.css({
            height: h,
            width: w
        });
    }


})();
