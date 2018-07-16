var gulp = require("gulp");
var cache = require('gulp-cached');
var tslint = require("gulp-tslint");

var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var sourceFilePath = "src/**/*";
var distFolder = "dist";

gulp.task("default", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});

gulp.task("compile", ["tslint"], function  (){
  gulp.src(sourceFilePath + ".{js,json}")
    .pipe(cache('copying'))
    .pipe(gulp.dest(distFolder));

  return tsProject.src()
    .pipe(cache('compiling'))
    .pipe(tsProject())
    .js.pipe(gulp.dest(distFolder))

});

gulp.task("tslint", function () {
  tsProject.src()
    .pipe(cache('linting'))
    .pipe(tslint({
      configuration: "tslint.json"
    }))
    .pipe(tslint.report())
});

gulp.task("clean", function () {
  return gulp.src(distFolder, { read: false })
    .pipe(clean());
});