'use strict';

const
    gulp = require('gulp'),
    ts = require('gulp-typescript'),
    log = require('fancy-log'),
    spawn = require('child_process').spawn;

let node;

const tsProject = ts.createProject('tsconfig.json');

const sourcePath = 'src';
const sourceMask = `${sourcePath}/*.ts`;

const distPath = 'dist';

gulp.task('build', function () {
    return gulp.src(sourceMask)
        .pipe(tsProject())
        .pipe(gulp.dest(distPath));
});

gulp.task('run', function () {
    if (node) node.kill();
    node = spawn('node', [`${distPath}/index.js`], { stdio: 'inherit' });
    node.on('close', function (code) {
        if (code) {
            log(`child process exited with code ${code}`);
        }
    });

    return Promise.resolve();
});

gulp.task('watch', function () {
    gulp.watch(`${sourcePath}/**/*`, gulp.series('build', /*'sass', 'html', */'run'));

    return Promise.resolve();
});

gulp.task('serve', gulp.series('build', /*'sass', 'html', */'run', 'watch'));

process.on('exit', function () {
    if (node) node.kill();
    log('Exit with code 0');
});
