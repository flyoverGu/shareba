var _ = require('underscore');


var defaultUser = {
    name: '',
    avatar: '',
    email: '',
    password: ''   
}

module.exports = function(o) {
    _.extend(this, defaultUser, o);
    return this;
}
