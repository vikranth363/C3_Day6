/*
 * Copyright 2009-2014 C3, Inc. dba C3 Energy (http://www.c3energy.come
 * This material, including without limitation any software, is the confidential trade secret
 * and proprietary information of C3 Energy and its licensors. Reproduction, use and distribution
 * of this material in any form is strictly prohibited except as set forth in a written
 * license agreement with C3 Energy and/or its authorized distributors.
 */

var args = require('optimist').argv,
  opts = {
    program: 'c3',
    startTime: new Date().getTime()
};

var lib = {
  url : require('url'),
  fs : require('fs'),
  http : require('http'),
  https : require('https'),
  async : require('async'),
  fse : require('fs-extra'),
  path: require('path'),
  log : {
    verbose: function (str) {
      if (!opts.quiet && opts.verbose) {
        console.log(str);
      }
    },

    info: function (str) {
      if (!opts.quiet) {
        console.log(str);
      }
    },

    error: function (str) {
      console.error(str);
    },

    fatal: function (str, code) {
      ifHelp(code, str);
      console.error(str);
      if (code !== 0) {
        code = 1;
      }
      process.exit(code);
    }
  }
};

lib.mkdirp = lib.fse.mkdirs;
lib.mkdirpSync = lib.fse.mkdirsSync;


var BaseOpts = '  -h, --help                       print this usage message\n' +
               '  -e, --url url                    specify the C3 server to connect to\n' +
               '  -v, --verbose                    verbose output\n' +
               '  -q, --quiet                      no output except errors\n';

var isServerAccessible = true;

function usage() {
  var s;

  //This should be in the bash script used to invoke the js
  s = opts.title || 'c3 -- C3 IoT Node.js application framework';
  console.log(s);

  s = opts.usage || '[ options ]';
  console.log(s);

  s = BaseOpts;
  if (opts.appOptsHelp)
    s += opts.appOptsHelp;
  console.log(s);
};

function addOpts(o) {
  var p, v, u;

  if (typeof o != 'object')
    return;

  for (p in o) {
    if (!o.hasOwnProperty(p))
      continue;

    if(p == "appOptsHelp"){
      if(opts[p]){
        opts[p] = opts[p] + o[p];
        continue;
      }
    }

    v = o[p];
    if (v != null)
      opts[p] = v;
  }
};

function readOpts() {
  var configFiles, data, i;

  // load config file in home and current directory
  configFiles = [ process.env.HOME + lib.path.sep + '.c3-node', '.' + lib.path.sep + '.c3-node' ];
  for (i = 0; i < configFiles.length; i++) {
    if (lib.fs.existsSync(configFiles[i])) {
      data = lib.fs.readFileSync(configFiles[i], {
        encoding: 'UTF-8',
        flag: 'r'
      });
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error("Error: " + opts.program + ': invalid config file: ' + configFiles[i]);
        process.exit(1);
      }
      addOpts(data);
    }
  }

  addOpts(args);

  addOpts({
    url: opts.url || opts.e,
    help: opts.help || opts.h,
    verbose: opts.verbose || opts.v,
    quiet: opts.quiet || opts.q
  });
};

function createDirs (filePath) {
  var sep = lib.path.sep;
  var splitPath = filePath.split(sep);
  var dirPath = splitPath.slice(0,splitPath.length-1).join(sep);
  lib.mkdirpSync(dirPath);
}

//Will be an instance of CacheClass
var cache;

var CacheClass = function (host) {
  this.host = host;
};

CacheClass.prototype.getCanonicalPath = function (path) {
  if (path) {
    var index = path.indexOf("?");
    if (index > 0) {
      path = path.substring(0, index);
    }
    if (process.env.OS_TYPE=="windows") {
      path = path.split("/").join("\\");
    }
  }

  return (process.env.CACHE_PATH || "/usr/local/share/c3/nodeapps/__cache") + lib.path.sep + this.host + path;
};

CacheClass.prototype.get = function (path) {
  return lib.fs.readFileSync(this.getCanonicalPath(path), {encoding: 'utf-8'});
};

CacheClass.prototype.getETag = function (path) {
  return lib.fs.readFileSync(this.getCanonicalPath(path) + ".etag", {encoding: 'utf-8'});
};

CacheClass.prototype.set = function (destPath, content) {
  createDirs(this.getCanonicalPath(destPath));
  return lib.fs.writeFileSync(this.getCanonicalPath(destPath), content, {encoding: 'utf-8'});
};

CacheClass.prototype.setETag = function (destPath, eTag) {
  createDirs(this.getCanonicalPath(destPath));
  return lib.fs.writeFileSync(this.getCanonicalPath(destPath) + ".etag", eTag, {encoding: 'utf-8'});
};

CacheClass.prototype.isPresent = function (path) {
  var filePath = this.getCanonicalPath(path);
  return (lib.fs.existsSync(filePath) && lib.fs.existsSync(filePath + ".eTag"));
};

function ifHelp(errorCode, message){
  if (opts.help) {
    usage();
    if (message) {
      console.log(message);
    }
    process.exit(errorCode ? errorCode : 0);
  }
}

function getFile(path, callback) {

  function callCallback(body) {
    if (callback){
      callback(body);
    } else {
      lib.log.fatal("Error: No callback functioned defined to retrieve data for " + path);
    }
  }

  if (isServerAccessible) {
    var getOptions = {
      hostname: opts.hostname,
      port: opts.port,
      path: path,
      headers: {}
    };

    if (opts.authToken) {
      getOptions.headers.Authorization = opts.authToken;
    }

    var cachePresent = cache.isPresent(path);
    if (cachePresent) {
      getOptions.headers["If-None-Match"] = cache.getETag(path);
    }

    var proto = lib[opts.protocol];
    var req = proto.get(getOptions, function(res) {
      var chunks = [];
      res.on('data', function(chunk) {
        chunks.push(chunk);
      }).on('end', function() {
        var body;
        if (cachePresent && res.statusCode == 304) {
          body = cache.get(path);
        } else {
          if (res.statusCode != 200) {
            lib.log.error("Error: " + opts.program + ': unable to download ' + path + ' (' + res.statusCode + ')');
            ifHelp(1);
            process.exit(1);
          }
          body = Buffer.concat(chunks).toString();
          cache.set(path, body);
          //all the headers are small case
          if (res.headers.etag) {
            cache.setETag(path, res.headers.etag);
          } else {
            lib.log.verbose("No ETag found in the response for " + path + ". Caching disabled.");
          }
        }

        callCallback(body);
      });
    }).on('error', function(e) {
      //We don't want to use the cache if the server is accessible and we encounter an error
      lib.log.error("\nError: " + opts.program + ': unable to connect to server ' + opts.url + ' (' + e.code + ')');
      if (!opts.help) {
        process.exit(1);
      }

      if (!cache.isPresent(path)) {
        lib.log.info("Cannot find any cache. In order to get help information you must have a valid running server to fetch that data from.");
        ifHelp(1);
        process.exit(1);
      }

      lib.log.info("Using cache. In order to get updated information you must have a valid running server to fetch the data from.");

      isServerAccessible = false;
      var body = cache.get(path);
      callCallback(body);
    });
  } else {
    if (cache.isPresent(path)) {
      var body = cache.get(path);
      callCallback(body);
    } else {
      lib.log.fatal("Error: Cannot find cache for " + path + "");
    }
  }
}

function setup(callback) {
  var req, data;

  // parse the url
  if (!opts.url)
    opts.url = 'http://localhost:8080/';
  data = lib.url.parse(opts.url);
  if (data == null) {
    console.error("Error: " + opts.program + ': invalid server URL specified: ' + opts.url);
    process.exit(1);
  }
  opts.https = /^https:/.test(opts.url);
  opts.hostname = data.hostname;
  opts.port = data.port || (opts.https ? 443 : 80);
  var bootPath = '/public/nodejs/boot.js';

  if (opts.https) {
    opts.protocol = 'https';
  } else {
    opts.protocol = 'http';
  }

  cache = new CacheClass(opts.hostname);

  getFile(bootPath, function(body) {
    /* jshint evil: true */
    eval(body);
    /* jshint evil: false */
    boot(opts,callback);
  });
}

module.exports = {
  usage: usage,
  setup: setup,
  options: function() { return opts; },
  downloadFile: getFile
};

if (require.main === module) {
  // load options from all sources
  readOpts();
  // run the boot.js
  setup();
}
