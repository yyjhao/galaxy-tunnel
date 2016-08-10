'use strict';

var gulp = require('gulp');
var ts = require('gulp-typescript');
var browserify = require('browserify');
var $ = require('gulp-load-plugins')();
var through2 = require('through2');
var runSequence = require('run-sequence');

gulp.task('connect', function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('app'))
        .use(connect.directory('app'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('serve', ['connect'], function () {
    require('opn')('http://localhost:9000');
});

gulp.task('styles', function () {
    return gulp.src('app/sass/**/*.scss')
            .pipe($.sass({errLogToConsole: true}))
            .pipe($.autoprefixer('last 1 version'))
            .pipe(gulp.dest('app/styles'))
            .pipe($.livereload());
});

gulp.task('styles-dist', function () {
    return gulp.src('app/sass/**/*.scss')
            .pipe($.sass({errLogToConsole: true}))
            .pipe($.autoprefixer('last 1 version'))
            .pipe(gulp.dest('app/styles'));
});

gulp.task('ts', function () {
    var tsProject = ts.createProject('app/ts/tsconfig.json', {
        noExternalResolve: false
    });
    return gulp.src(['app/ts/**/*.ts', 'typings/**/*.ts', 'node_modules/typed-react/*.d.ts'])
            .pipe(ts(tsProject))
            .pipe(gulp.dest('app/js'));
});


gulp.task('minify-js', function () {
    // transform regular node stream to gulp (buffered vinyl) stream
    var browserified = through2.obj(function (file, enc, next){
        var b = browserify({ entries: file.path, debug: true });
        return b.bundle(function(err, res){
            file.contents = res;
            next(null, file);
        });
    });

    return gulp.src(['app/js/main.js', 'app/js/hs.js'])
        .pipe(browserified)
        .pipe($.sourcemaps.init({ loadMaps: true }))
        .pipe($.uglify())
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('app/scripts'));
});

gulp.task('concat-js', function() {
    // transform regular node stream to gulp (buffered vinyl) stream
    var browserified = through2.obj(function (file, enc, next){
        var b = browserify({ entries: file.path, debug: true });
        return b.bundle(function(err, res){
            if (err) {
                console.log(err);
                return;
            }
            file.contents = res;
            next(null, file);
        });
    });

    return gulp.src(['app/js/main.js', 'app/js/hs.js'])
        .pipe(browserified)
        .pipe(gulp.dest('app/scripts'))
        .pipe($.livereload());
});

gulp.task('update-script', function() {
    runSequence('ts', 'concat-js');
});

gulp.task('watch', ['serve'], function () {
    var server = $.livereload();
    gulp.watch('app/sass/**/*.scss', ['styles']);
    gulp.watch('app/ts/**/*.ts', ['update-script']);
    gulp.watch([
            'app/*.html'
    ]).on('change', function (file) {
        server.changed(file.path);
    });
});

gulp.task('dist', function() {
    runSequence('styles-dist', 'ts', 'minify-js');
});
