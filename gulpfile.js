var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

function bs() {
    browserSync.init({
        files: ["src/*"],
        server: {
            baseDir: "./src",
            routes: {
                '/node_modules': './node_modules'
            }
        }
    });
}

gulp.task('browser-sync', function() {
    bs();
});

gulp.task('default', function () {
    bs();
});