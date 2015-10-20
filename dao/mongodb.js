var MongoClient = require('mongodb').MongoClient;
var poolModule = require('generic-pool');

module.exports = mongo;

function mongo(options) {
    options = options || {};
    var host = options.host || 'localhost';
    var port = options.port || 27017;
    var max = options.max || 100;
    var min = options.min || 1;
    var timeout = options.timeout || 30000;
    var log = options.log || false;
    var db = options.db;
    var mongoUrl = options.uri || options.url;
    if (!mongoUrl) {
        if (options.user && options.pass) {
            mongoUrl = 'mongodb://' + options.user + ':' + options.pass + '@' + host + ':' + port;
        } else {
            mongoUrl = 'mongodb://' + host + ':' + port;
        }
        if (db) {
            mongoUrl = mongoUrl + '/' + db;
        }
    }

    var mongoPool = poolModule.Pool({
        name: 'koa-mongo',
        create: function(callback) {
            MongoClient.connect(mongoUrl, {
                server: {
                    poolSize: 1
                },
                native_parser: true,
                uri_decode_auth: true
            }, function(err, client) {
                if (err) throw err;
                callback(err, client);
            });
        },
        destroy: function(client) {
            client.close();
        },
        max: max,
        min: min,
        idleTimeoutMillis: timeout,
        log: log
    });

    return mongoPool.acquire;
}
