'use strict';

const
    gulp = require('gulp'),
    fileSync = require('gulp-file-sync'),
    fs = require('fs'),
    browserify = require("browserify"),
    source = require("vinyl-source-stream"),
    tsify = require("tsify"),
    browserSync = require('browser-sync').create(),
    mustache = require("gulp-mustache"),
    sass = require('gulp-sass');

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
    }).plugin(tsify, { project: sourcePath })
        .bundle()
        .pipe(source("bundle.js"))
        .pipe(gulp.dest(distPath));
});

gulp.task('sass', function () {
    return gulp.src(`${sourcePath}/**/*.scss`)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest(distPath));
});

gulp.task('sync-files', function () {
    return new Promise((resolve, reject) => {
        fileSync(sourcePath, distPath, {
            ignore: [/^.+\.ts$/i, /^.+\.mustache$/i, /^.+\.scss$/i, 'tsconfig.json'],
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

gulp.task('compile-templates', function () {
    return gulp.src(`${sourcePath}/*.mustache`)
        .pipe(mustache({}, { extension: '.html' }))
        .pipe(gulp.dest(distPath));
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

    return gulp.watch(`${sourcePath}/**/*`, gulp.series('sync-files', 'sass', 'compile-templates', 'build', 'reload-browser'));
});

gulp.task('serve', gulp.series('sync-files', 'sass', 'compile-templates', 'build', 'watch'));

gulp.task('gain', function (done) {
    const carrier = '../../abibits/octopus-frontend-ng5';

    fs.copyFile(
        `${carrier}/src/app/widgets/revisions-tree/revisions-tree.component.html`,
        `${sourcePath}/partials/tree.mustache`,
        console.error,
    );

    fs.copyFile(
        `${carrier}/src/app/widgets/revisions-tree/revisions-tree.ts`,
        `${sourcePath}/revisions-tree.ts`,
        console.error,
    );

    fs.copyFile(
        `${carrier}/src/app/models/revisions/revision.ts`,
        `${sourcePath}/models/revisions/revision.ts`,
        console.error,
    );

    fs.copyFile(
        `${carrier}/src/app/models/revisions/revision-tree-model.ts`,
        `${sourcePath}/models/revisions/revision-tree-model.ts`,
        console.error,
    );

    fs.copyFile(
        `${carrier}/src/app/models/user.ts`,
        `${sourcePath}/models/user.ts`,
        console.error,
    );

    fs.copyFile(
        `${carrier}/src/app/models/unit.ts`,
        `${sourcePath}/models/unit.ts`,
        console.error,
    );

    fs.copyFile(
        `${carrier}/src/app/models/locality.ts`,
        `${sourcePath}/models/locality.ts`,
        console.error,
    );

    fs.copyFile(
        `${carrier}/src/styles/revisions.scss`,
        `${sourcePath}/revisions.scss`,
        console.error,
    );

    done();
});
