var gulp = require('gulp');
var exec = require('child_process').exec;

gulp.task('compile-demo', (done) => {
    exec('node-tsc main.ts -m amd', (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        done(); // continue even if there's errors.
    });
});
gulp.task('compile-browser', (done) => {
    exec('node-tsc -b browser', (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        done(); // continue even if there's errors.
    });
});
gulp.task('compile-worker', (done) => {
    exec('node-tsc -b worker', (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        done(); // continue even if there's errors.
    });
});

gulp.task('setup', () => {
    return gulp.src([
        'node_modules/requirejs/require.js',
    ]).pipe(gulp.dest('lib'));
});

gulp.task('copy', () => {
    return gulp.src([
        'js/mailbox-host.js',
        'js/mailbox-worker.js'
    ]).pipe(gulp.dest('build'));
});
gulp.task('copy-publish', () => {
    return gulp.src([
        'README.md',
        'LICENSE.md'
    ]).pipe(gulp.dest('build'));
});
