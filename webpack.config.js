module.exports = {
    context: __dirname + '/public/',
    entry: {
        'movie/bundle': './movie/index.js',
        'pic/bundle': './movie/index.js'
    },
    output: {
        path: __dirname + '/public/',
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.scss$/,
            loaders: ['style', 'css', 'sass']
        }]
    }
}
