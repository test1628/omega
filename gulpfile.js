"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss"); //для автопрефикс
var posthtml = require("gulp-posthtml");  //для svg sprite
var include = require("posthtml-include");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var jsmin = require('gulp-jsmin');
var rename = require("gulp-rename");
var del = require("del");
var server = require("browser-sync").create();
var run = require("run-sequence"); //чтобы задачи послед-но выполнялись, а не асинх

gulp.task("style", function() {
  gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({ grid: true })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("sprite", function() {
  return gulp.src("src/img/sprite-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function() {
  return gulp.src("src/*.html")
    .pipe(posthtml([
        include()
      ]))
    .pipe(gulp.dest("build"))
    .pipe(server.stream());
});

gulp.task('script', function () {
  gulp.src('src/**/*.js')
    .pipe(jsmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build'));
});

gulp.task("images", function() {
  gulp.src("src/img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("src/img"))
});

gulp.task("copy", function() {
  return gulp.src([
    "src/fonts/**/*.{woff,woff2}",
    "src/img/**"
    ], {
      base: "./src" //откуда брать начало, чтобы все файлы оказались в нужных папках
    })
    .pipe(gulp.dest("build"));
});
gulp.task("clean", function() {
  return del("build");
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("src/sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("src/*.html", ["html"]);
});

gulp.task("build", function(done) {
  run(
    "clean",
    "copy",
    "style",
    "script",
    "sprite",
    "html",
    done
  );
});
