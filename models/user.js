var _ = require('underscore');


var defaultUser = {
    name: 'flyover',
    avatar: '',
    email: '',
    password: ''   
}

module.exports = function(o) {
    _.extend(this, defaultUser, o);
    return this;
}
