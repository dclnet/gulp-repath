"use strict";

var assert = require('assert');
var gutil = require('gulp-util');
var repath = require('../index');
var path = require('path');
var fs = require('fs');

var config = {
  verMode: 'hash',
  baseMap: {assets: path.join(__dirname, './assets')},
  replace: {
    '@cdn/': '//localhost:8080/'
  }
};

describe('Test in hash mode', function() {
  describe('CSS Test', function() {

    it('css', function() {

      var stream = repath(config);
      var filepath = path.join(__dirname, './assets/style.css');

      stream.write(new gutil.File({
        //path: filepath,
        contents: fs.readFileSync(filepath)
      }));

      stream.on('data', function(file) {
        var contents = file.contents.toString();

        assert(!/@cdn/.test(contents), 'The CDN url should be replaced.');

        assert(!/kawayi\.(jpg|jpeg|gif|png)/.test(contents), 'The image name should be replaced.');

        //console.log(contents);
      });
    });

  });

  describe('HTML Test', function() {
    it('html', function() {
      var stream = repath(config);
      var filepath = path.join(__dirname, './assets/index.html');

      stream.write(new gutil.File({
        //path: filepath,
        contents: fs.readFileSync(filepath)
      }))

      stream.on('data', function(file) {
        var contents = file.contents.toString();
        assert(!/@cdn/.test(contents), 'The CDN url should be replaced.');

        assert(!/\/[a-z0-9_]*\.(jpg|jpeg|gif|png)/i.test(contents), 'The image should be replaced.');

        assert(!/\/[a-z0-9_]*\.js/i.test(contents), 'The javascript should be replaced.');

        //console.log(contents);
      });
    });
  });

});

//---------------------------------------
/*
describe('Test in param mode', function() {
  describe('CSS Test', function() {

    it('css', function() {

      var stream = repath(config);
      var filepath = path.join(__dirname, './assets/style.css');

      stream.write(new gutil.File({
        //path: filepath,
        contents: fs.readFileSync(filepath)
      }));

      stream.on('data', function(file) {
        var contents = file.contents.toString();

        assert(!/@cdn/.test(contents), 'The CDN url should be replaced.');

        assert(!/\/.*\.(jpg|jpeg|gif|png)$/.test(contents), 'The image name should be replaced.');

        //console.log(contents);
      });
    });

  });

  describe('HTML Test', function() {
    it('html', function() {
      var stream = repath(config);
      var filepath = path.join(__dirname, './assets/index.html');

      stream.write(new gutil.File({
        //path: filepath,
        contents: fs.readFileSync(filepath)
      }))

      stream.on('data', function(file) {
        var contents = file.contents.toString();
        assert(!/@cdn/.test(contents), 'The CDN url should be replaced.');

        assert(!/\/.*\.(jpg|jpeg|gif|png)$/i.test(contents), 'The image should be replaced.');

        assert(!/\/.*\.js$/i.test(contents), 'The javascript should be replaced.');

        //console.log(contents);
      });
    });
  });
});
*/