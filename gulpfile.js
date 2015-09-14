var gulp = require('gulp');
var sass = require('gulp-sass');


var bp = './public/styles/';
gulp.task('sass', function() {
    gulp.src(bp + 'scss/main.scss')
        .pipe(sass())
        .pipe(gulp.dest(bp + 'css'));
});


