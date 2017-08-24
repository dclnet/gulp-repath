var fs = require('fs');
var crypto = require('crypto');
var _ = require('underscore');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-repath';

var defaults = {
  verMode: 'param',
  hashName: '{origin}-{hash}',
  baseMap: {},
  element: ['script', 'style', 'image'],
  excludeFile: [],
  replace: {}
};
/*
* 替换config.replace
*/
function replacePath(string, replaces) {
  for(let key in replaces) {
    string = string.replace(key, replaces[key]);
  }
  return string;
}

/*
* 替换引用
*/
function replacePaths(string, config, parentPick, childPick) {
  let newUrl = '';
  let matchs = parentPick(string);

  if (matchs && matchs.length > 0) {
    for(let i = 0; i < matchs.length; i++) {
      let nodes = childPick(matchs[i]);
      let filename = nodes[1].substr(nodes[1].lastIndexOf('/') + 1);
      if ((config.verMode !== 'origin') && (config.excludeFile.indexOf(filename) === -1)) {
        // to do replace
        if (config.verMode === 'hash') {
          newUrl = hashPath(nodes[1], config);
        } else if (config.verMode === 'param') {
          newUrl = paramPath(nodes[1], config);
        }
      }
      if (newUrl) {
        newUrl = replacePath(newUrl, config.replace);
      } else {
        newUrl = replacePath(nodes[1], config.replace);
      }
      string = string.replace(nodes[1], newUrl);
      newUrl = '';
    }
  }
  return string;
}

/*
* 获取文件路径
*/
function getFilePath(url, baseMap) {
  for(let base in baseMap) {
    if (url.indexOf(base) !== -1) {
      return baseMap[base] + url.substr(url.indexOf(base) + base.length);
    }
  }
  return '';
}

/*
* 获取文件Hash
*/
function getFileHash(filepath) {
  if (fs.existsSync(filepath)) {
    var stat = fs.statSync(filepath);
    // 以文件最后一次修改时间计算hash
    return crypto.createHash('md5').update(stat['mtimeMs']+'').digest('hex');
  }
  return '';
}

/*
* 混入hash值以重命名文件
*/
function hashPath(url, config) {
  var origin = '';
  var filepath = getFilePath(url, config.baseMap);
  var hash = getFileHash(filepath).substr(0, 16);
  if (!hash) return url;
  var newFilePath = '';
  var filename = url.substr(url.lastIndexOf('/') + 1);
  filename = origin = filename.substr(0, filename.lastIndexOf('.'));
  if (config.hashName) {
    filename = config.hashName.replace('{origin}', filename);
    filename = filename.replace('{hash}', hash);
    newFilepath = filepath.replace(origin, filename);
    if (!fs.existsSync(newFilePath)) {
      let originFileStream = fs.createReadStream(filepath);
      let newFileStream = fs.createWriteStream(newFilepath);
      originFileStream.pipe(newFileStream);
      newFileStream.on('close', function() {
      });
    }
  }
  return url.replace(origin, filename);
}

/*
* url添加参数ver=版本
*/
function paramPath(url, config) {
  var filepath = getFilePath(url, config.baseMap);
  var hash = getFileHash(filepath).substr(0, 16);
  hash || (hash = (new Date()).getTime());
  if (url.indexOf('?') === -1) {
    url = url + '?ver=' + hash;
  } else {
    url = url + '&ver=' + hash;
  }
  return url;
}

function replaceScript(string, config, parentPick, childPick) {
  return replacePaths(string, config, parentPick, childPick);
}

function replaceStyle(string, config, parentPick, childPick) {
  return replacePaths(string, config, parentPick, childPick);
}

function replaceImage(string, config, parentPick, childPick) {
  return replacePaths(string, config, parentPick, childPick);
}

/*
* 替换内容
*/
function doReplace(string, config) {
  // 替换图片类引用
  if (config.element.indexOf('image') !== -1) {
    string = replaceImage(string, config, function(string) {
      let matchs = [];
      matchs = string.match(/<img\s?[^>]*\s?src="([^"]*)"[^>]?>/ig);
      let cssUrls = string.match(/url\s?\("?([^)]*)"?\)/ig);
      if (matchs && cssUrls) {
        matchs = matchs.concat(cssUrls);
      } else if (cssUrls) {
        matchs = cssUrls;
      }
      return matchs;
    }, function(string) {
      let nodes = '';
      if (string.indexOf('<img') === -1) {
        nodes = string.split(/url\s?\(\s?"?([^)]*\.[a-z]*)"?\s?\)/ig);
      } else {
        nodes = string.split(/src="([^"]*)"/ig);
      }
      return nodes;
    });
  }
  // 替换样式引用
  if (config.element.indexOf('style') !== -1) {
    string = replaceStyle(string, config, function(string) {
      return string.match(/<link\s?[^>]*\s?href="([^"]*)"[^>]?>/ig);
    }, function(string) {
      return string.split(/href="([^"]*)"/ig);
    });
  }
  // 替换script引用
  if (config.element.indexOf('script') !== -1) {
    string = replaceScript(string, config, function(string){
      return string.match(/<script\s?[^>]*\s?src="([^"]*)"[^>]?>/ig);
    }, function(string) {
      return string.split(/src="([^"]*)"/ig);
    });
  }
  return string;
}

function gulpRepath(config) {
  config = _.defaults((config || {}), defaults);

  if (!config) {
    throw new PluginError(PLUGIN_NAME, 'Missing argument.');
  }

  var stream = through.obj(function(file, enc, cb) {
    if (file.isBuffer()) {
      file.contents = new Buffer(doReplace(file.contents.toString(), config));
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Stream not supported!'));
      return cb();
    }

    this.push(file);
    cb();
  });

  return stream;
}

module.exports = gulpRepath;
