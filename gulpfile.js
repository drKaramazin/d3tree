'use strict';

const
    gulp = require('gulp'),
    fileSync = require('gulp-file-sync'),
    fs = require('fs'),
    browserify = require("browserify"),
    source = require("vinyl-source-stream"),
    tsify = require("tsify"),
    browserSync = require('browser-sync').create();

const sourcePath = 'src';
const distPath = 'dist';
const nodeModules = 'node_modules';

gulp.task('build', function () {
    return browserify({
        basedir: ".",
        debug: true,
        entries: [`${sourcePath}/main.ts`],
        cache: {},
        packageCache: {},
    }).plugin(tsify)
        .bundle()
        .pipe(source("bundle.js"))
        .pipe(gulp.dest(distPath));
});

gulp.task('sync-files', function () {
    return new Promise((resolve, reject) => {
        fileSync(sourcePath, distPath, {
            ignore: /^.+\.ts$/i,
        });

        let d3Ready, d3Hierarchy;

        const callback = (err) => {
            if (err) {
                reject(err);
            }

            if (d3Ready && d3Hierarchy) {
                resolve();
            }
        }

        fs.copyFile(`${nodeModules}/d3/dist/d3.min.js`, `${distPath}/d3.min.js`, (err) => {
            d3Ready = true;
            callback(err);
        });

        fs.copyFile(`${nodeModules}/d3-hierarchy/dist/d3-hierarchy.min.js`, `${distPath}/d3-hierarchy.min.js`, (err) => {
            d3Hierarchy = true;
            callback(err);
        });
    });
});

gulp.task('reload-browser', function (done) {
    browserSync.reload();
    done();
});

gulp.task('watch', function () {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });

    return gulp.watch(`${sourcePath}/**/*`, gulp.series('sync-files', 'build', 'reload-browser'));
});

gulp.task('serve', gulp.series('sync-files', 'build', 'watch'));
