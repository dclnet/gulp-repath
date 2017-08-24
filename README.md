# [gulp](https://github.com/gulpjs/gulp)-repath

> rewrite url(script src,link href, img url...)

## Install

```sh
$ npm install --save gulp-repath
```

## Usage

Using gulp-repath replace links to assets in html/css templates.
```js
var gulp = require('gulp');
var repath = require('./gulp-repath');

var repathConf = {
  verMode: 'hash',  // origin, hash, param
  hashName: '{origin}-{hash}',
  baseMap: {'static': './static'},
  element: ['script', 'style', 'image'],
  excludeFile: [],
  replace: {
    '@cdn/': '//localhost:8080/'
  }
};

gulp.task('css', function() {
  gulp.src('./src/*.css')
    .pipe(gulp.dest('static/css'));
});

gulp.task('html', function() {
  return gulp.src('./src/*.html')
  .pipe(gulp.dest('./'));
});

gulp.task('finale-css', ['css', 'html'], function() {
  return gulp.src('static/css/*.css')
    .pipe(repath(repathConf))
    .pipe(gulp.dest('static/css'));
});

gulp.task('finale-html', ['finale-css'], function() {
  return gulp.src('./*.html')
    .pipe(repath(repathConf))
    .pipe(gulp.dest('./'));
});

gulp.task('prod', ['finale-html']);

```
### It's output

#### in `hash` mode:

`/static/js/api.js` => `/static/js/api-a3b35d82dd89ab76.js`

`@cdn/static/img/bg.jpg` => `//localhost:8080/static/img/bg-a3b35d82dd89ab76.jpg`

#### in `param` mode:

`/static/js/api.js` => `/static/js/api.js?ver=a3b35d82dd89ab76`

`@cdn/static/img/bg.jpg` => `//localhost:8080/static/img/bg.jpg?ver=a3b35d82dd89ab76`

### Options

#### verMode
Type : `String`

One of `origin`, `hash`, `param`, Default value is `param`

`origin` : nothing to do

`hash` : rename file name add file's hash use option hashName

"/static/js/api.js" => "/static/js/api-a3b35d82dd89ab76.js"

`param` : add ver=hash to url

"/static/js/api.js" => "/static/js/api.js?ver=a3b35d82dd89ab76"

#### hashName
Type : `String`

Use only verMode is `hash`, {origin} is origin file name, {hash} is file's hash,
Default value is '{origin}-{hash}'

#### baseMap
Type : `Object`

url => directories
```js
baseMap: {'static': './static'}
```
url "/static/js/api.js" => local file "./static/js/api.js"

#### element
Type : `Array`

Replace element, `script`: javascript src, `style`: link href, `image`: img src or url(xxxx) in css, Default value is ['script', 'style', 'image']

#### excludeFile
Type : `Array`

The files no be replace process.

#### replace
Type : `Object`

url path to be replace
```js
  replace: {
    '@cdn/': '//localhost:8080/'
  }
```
It will replace "@cdn/static/js/api.js" to "//localhost:8080/satic/js/api.js"
