var _ = require('underscore');

var defaultPost = {
    author: '',
    time: Date.now(),
    title: '',
    tags: [],
    content: '',
    pv: 0
}

module.exports = function(o, u) {
    _.extend(this, defaultPost, o);   
    this.author = u.id;
    return this;
}
