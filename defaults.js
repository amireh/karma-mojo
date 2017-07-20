// @file karma.development.conf.js
//
// You shouldn't need to use this file directly. Use `bin/mojo` instead. <<<
//

var path = require('path');
var os = require('os');

module.exports = {
  pattern: process.env.MOJO_PATTERN || [
    '**/__tests__/*.test.js',
  ],
  runnerPath: (
    process.env.MOJO_RUNNER_PATH ||
    path.resolve(process.env.MOJO_TEMP_DIR || os.tmpdir(), 'mojo-runner.js')
  ),
  cachePath: (
    process.env.MOJO_CACHE_PATH ||
    path.resolve(process.env.MOJO_TEMP_DIR || os.tmpdir(), 'mojo.cache.json')
  ),
  continue: process.env.MOJO_CONTINUE === '1',
  creep: process.env.MOJO_CREEP === '1',
  focus: process.env.MOJO_FOCUS === '1',
  noCache: process.env.MOJO_NO_CACHE === '1',
  rude: process.env.MOJO_RUDE === '1',
  grep: process.env.MOJO_GREP || null,
  grepDir: process.env.MOJO_GREP_DIR || '{src}',
};
