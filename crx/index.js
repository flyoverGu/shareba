(function() {
    var el = document.createElement('iframe');
    el.src = "http://letshareba.com";
    document.body.appendChild(el);

    $(el).css({
        position: "fixed",
        top: 0,
        'z-index': 99999,
        border: 'solid 1px #666',
        'box-shadow': '2px 4px 14px'
    })
})();
