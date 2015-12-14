module.exports = {
    context: __dirname + '/public/movie',
    entry: './index.js',
    output: {
        path: __dirname + '/public/movie',
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /\.scss$/,
            loaders: ['style', 'css', 'sass']
        }]
    }
}
