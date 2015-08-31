var gulp = require('gulp');
var sass = require('gulp-sass');


gulp.task('compass', function() {
    gulp.src('./styles/scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./styles/css/'));
});

gulp.task('watch', function() {
    gulp.watch('./styles/scss/*.scss', ['compass']);
});
