
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import autoprefixer from 'autoprefixer';
import browserSync from 'browser-sync';
import del from 'del';
import browserify from 'browserify';
import babelify from 'babelify';
import cssModulesify from 'css-modulesify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import preCss from 'precss';
import customProperties from 'postcss-custom-properties';
import atImport from 'postcss-import';

const $ = gulpLoadPlugins();
const gulpsync = require('gulp-sync')(gulp);
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src(['app/styles/core.css', 'app/styles/modules.css'])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.postcss([
      atImport(),
      customProperties(),
      autoprefixer({browsers: ['> 1%', 'last 5 versions']}),
    ]))
    .pipe($.sourcemaps.write('maps'))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.size({
      'showFiles': true
    }));
});

gulp.task('scripts', () => {
  const b = browserify('app/scripts/app.js').transform(babelify, {presets: ['es2015', 'react']});

  return b
    .plugin(cssModulesify, {
      rootDir: './app/scripts',
      output: './.tmp/_css-modules.css',
      generateScopedName: cssModulesify.generateShortName
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe($.size({
      'showFiles': true
    }));
});

gulp.task('html', gulpsync.sync(['scripts', 'styles']), () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', gulpsync.sync(['scripts', 'styles']), () => {
  browserSync({
    notify: false,
    port: 9000,
    open: false,
    server: {
      baseDir: ['.tmp', 'app']
    }
  });

  gulp.watch([
    'app/*.html',
    '.tmp/scripts/**/*.js',
    '.tmp/styles/**/*.css',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.css', ['styles']);
  gulp.watch('app/scripts/**/*', gulpsync.sync(['scripts', 'styles']));
  gulp.watch('app/fonts/**/*', ['fonts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9001,
    server: {
      baseDir: ['dist']
    }
  });
});


gulp.task('build', ['html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
