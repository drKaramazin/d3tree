'use strict';

const
    gulp = require('gulp'),
    ts = require('gulp-typescript'),
    fileSync = require('gulp-file-sync');

const tsProject = ts.createProject('tsconfig.json');

const sourcePath = 'src';
const distPath = 'dist';

gulp.task('build', function () {
    return gulp.src(`${sourcePath}/*.ts`)
        .pipe(tsProject())
        .pipe(gulp.dest(distPath));
});

gulp.task('sync-files', function () {
    fileSync(sourcePath, distPath, {
        ignore: /^.+\.ts$/i,
    });

    return Promise.resolve();
});

gulp.task('watch', function () {
    gulp.watch(`${sourcePath}/**/*`, gulp.series('sync-files', 'build'));

    return Promise.resolve();
});

gulp.task('serve', gulp.series('sync-files', 'build', 'watch'));
