var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');
var glob = require('glob');
var exec = require('child_process').exec;
var defaults = require('./defaults');
var root = process.cwd();

function Mojo(emitter, config, executor, logger) {
  var basePath = process.cwd();
  var outPath = config.runnerPath;
  var log = logger.create('Mojo');
  var testFiles = {};
  var watcher = new chokidar.FSWatcher({
    usePolling: true,
    ignorePermissionErrors: true,
    ignoreInitial: true,
    followSymlinks: false
  });

  function expandPath(filePath) {
    return path.resolve(basePath, filePath);
  }

  function creep(filePath) {
    return glob.sync(path.dirname(filePath) + '/*.test.js');
  }

  function track(filePath) {
    if (!testFiles.hasOwnProperty(filePath)) {
      if (config.creep) {
        creep(filePath).forEach(function(siblingFilePath) {
          testFiles[siblingFilePath] = true;
        });
      }
      else if (config.focus) {
        testFiles = {};
      }

      testFiles[filePath] = true;

      return true;
    } else {
      return false;
    }
  }

  function untrack(filePath) {
    if (testFiles.hasOwnProperty(filePath)) {
      delete testFiles[filePath];
      return true;
    } else {
      return false;
    }
  }

  function generateRunner() {
    fs.writeFileSync(
      outPath,
      Object.keys(testFiles).sort().map(function(filePath) {
        return 'require("' + filePath + '");';
      }).join('\n')
    );
  }

  function loadFromCache() {
    if (fs.existsSync(config.cachePath)) {
      var cache = JSON.parse(fs.readFileSync(config.cachePath, 'utf-8'));
      var cacheFiles = Object.keys(cache);
      var needsToRegenerate = false;

      if (cacheFiles.length > 0) {
        cacheFiles
          // ignore removed files, happens when switching branches yo
          .filter(function(filePath) {
            return fs.existsSync(filePath);
          })
          .forEach(function(filePath) {
            var wasTracked = track(filePath);

            if (!needsToRegenerate && wasTracked) {
              needsToRegenerate = true;
            }
          })
        ;
      }

      if (needsToRegenerate) {
        generateRunner();
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function grep(callback) {
    exec('egrep -rl "describe\\([\'\\"].*' + config.grep + '" ' + config.grepDir, {
      cwd: root
    }, function(error, stdout) {
      if (!error) {
        callback(stdout.split('\n').filter(function(fileName) {
          return fileName.indexOf('.test.js') > -1;
        }));
      }
    });
  }

  function run() {
    if (Object.keys(testFiles).length) {
      executor.schedule();
    }
  }

  watcher
    .on('add', function(file) {
      if (track(expandPath(file))) {
        log.info('A test file was created, will now be tracking. (' + file + ')');
        generateRunner();
      }
    })
    .on('change', function(file) {
      if (track(expandPath(file))) {
        log.info('A test file was modified, tracking:', file);
        generateRunner();
      }
    })
    .on('unlink', function(file) {
      if (untrack(expandPath(file))) {
        log.info('A test file is no longer tracked as it was deleted.');
        generateRunner();
      }
    })
    // If we don't subscribe; unhandled errors from Chokidar will bring Karma down
    // (see GH Issue #959)
    .on('error', function(e) {
      log.debug(e);
    })
  ;

  // The runner file needs to exist for the webpack loader to function.
  //
  // See test/profiles/development.js
  fs.writeFileSync(outPath, '');

  if (config.continue) {
    if (loadFromCache()) {
      log.info('Reloaded previously tracked test files.');
    }
  }

  if (config.grep && config.grep.length) {
    grep(function(fileList) {
      log.info('Grepped:', fileList);
      fileList.map(expandPath).forEach(track);
      generateRunner();
    });
  }

  var installed = false;

  // invoke the executor only when the browser(s) are ready
  emitter.on('browsers_ready', function() {
    // need to guard because this would run multiple times if a browser was
    // killed and restarted
    if (!installed) {
      log.info('Capturing.');
      installed = true;

      emitter.on('file_list_modified', function() {
        run();
      });

      // run in case we loaded from (a non-empty) cache
      run();
    }
  });

  // dump the cache if viable and clean up
  emitter.on('exit', function(done) {
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }

    if (!config.noCache) {
      fs.writeFileSync(config.cachePath, JSON.stringify(testFiles, null, 2));
    }

    watcher.close();
    done();
  });

  [].concat(config.pattern).forEach(function(x) {
    watcher.add(x);
  });

  if (!config.rude) {
    greet(log); // yeah !!!
  }
}

function greet(log) {
  var asdf = fs.readFileSync(path.resolve(__dirname, 'greeting.txt'), 'utf-8');
  var greetings = asdf.split('[]');

  log.info(
    '\n' +
    greetings[Math.floor((Math.random() * greetings.length))].trim() +
    '\n'
  );
}

Mojo.$inject = [ 'emitter', 'config.mojo', 'executor', 'logger' ];

module.exports = { 'reporter:mojo': [ 'type', Mojo ] };
module.exports.defaults = defaults;