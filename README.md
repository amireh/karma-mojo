# karma-mojo

Mojo is a plugin for Karma that provides a binary for running only a select
subset of tests at a time instead of running the whole test suite.

The way it works is that it watches test files you edit and tracks them in a
file that will be fed to Karma to run. This way, your testing session stays
lean and mean!

The `mojo` binary is a wrapper CLI for Karma the lets you launch and configure
the plugin directly from the command-line.

## Installation & Configuration

You'll have to do some wiring to get this to function since you need to
customize your Karma config to support Mojo. First, install the package from
npm:

```shell
npm install --save-dev karma-mojo
```

Then copy your `karma.conf.js` file to `karma.mojo.conf.js` and make the
adjustments explained in [examples/karma.mojo.conf.js].

Read more for a run-down of the options that may help you test during
development.

## Options & Modes

Run `mojo --help` to see the list of available options. Some of the more
cryptic options will be explained here.

### The pick-up-where-you-left-off mode (`--continue`)

If you terminate Mojo and would like to run it again later to resume the work
you had been doing, you can pass `--continue` as an argument and it will start
off with the _test files you had last worked on_ - no need to manually re-track
them all.

### Tunnel-visioning with `--focus`

When this mode is engaged, Mojo will exhibit an advanced stage of amnesia where
it will only run the very last test module that you edit, forgetting all past
test modules that have been tracked during the active session.

### The CREEP mode (`--creep`)

When using `mojo --creep`, Mojo will now not only track the test files you're editing, but also all their siblings within that module group. This is useful
if you're testing a group of interrelated modules and you want to watch out for
any breakage during refactor.

For example, let's say you edit a file at:

    /components/__tests__/A.test.js

Mojo will now also track all test files under:

    /components/__tests__/

This saves you from manually adding all the test files to the tracker by
editing/touching them.

### Grepping for goodies with `--grep` and `--grep-dir`

Start a session with **test suites** that match the grepping pattern. The
pattern is used to locate test modules that define test "suites" with names
matching that pattern.

This assumes you're using mocha (BDD) or something similar where test suites
are defined using the following notation:

    describe("suite name")

You can control the directory in which test files are grepped by supplying the
`--grep-dir` option, which defaults to `{src}`.

For example, let's run all the tests that have to do with `Account`:

    mojo --grep 'Account'

This option uses the `egrep` command and expects it to be available in PATH.

### `--temp-dir`

Mojo needs a directory to store its artifacts, and that's referred to as the
temp directory. The directory must be writable by the running user. It defaults
to `os.tmpdir()` and can be configured with this option.

### `--no-cache`

Tell Mojo not to store its runner file to the disk when it's about to exit. 
Normally this is enabled in order to support the `--continue` mode.

### `--no-greeting`

Tell Mojo not to print the greeting ASCII art message. But why would you?
Please reconsider.

## Passing options to Karma

You can forward options that `mojo` doesn't understand to Karma normally. For
example:

    mojo --browsers Firefox

The `--browsers` option and value will be passed to Karma as-is.

> NOTE: the binary will always pass the config filename to Karma as the first
> argument and unfortunately it's not yet configurable. That filename is
> `karma.mojo.conf.js`.

## Exported Environment Variables

The following environment variables are exported when you run the `mojo`
binary. You can make use of them in your `karma.mojo.conf.js` file if
needed, and they are used by the `defaults.js` file provided by the plugin
to configure the mojo plugin.

See how those variables are put to use in [examples/karma.mojo.conf.js].

### `MOJO_CONTINUE`

- Setting to `"1"` instructs Mojo to [resume the last session](#the-pick-up-where-you-left-off-mode---continue),
  if any.
- Exposed by the `--continue` CLI argument.

### `MOJO_CREEP`

- Setting to `"1"` instructs Mojo to [creep](#the-creep-mode---creep).
- Exposed by the `--creep` CLI argument.

### `MOJO_NO_CACHE`

- Setting to `"1"` instructs Mojo not to save the runner file for future runs
  (see the `--continue` options).
- Exposed by the `--no-cache` CLI argument.

### `MOJO_RUDE`

- Setting to `"1"` instructs Mojo not to print the greeting message.
- Exposed by the `--no-greeting` CLI argument.

### `MOJO_GREP`

- Defines the grep pattern, if any.
- Exposed by the `--grep` CLI argument.

### `MOJO_GREP_DIR`

- Defines the directory glob pattern in which files should be grepped.
- Defaults to `{src}`
- Exposed by the `--grep-dir` CLI argument.

### `MOJO_FOCUS`

- Setting to `"1"` instructs Mojo to go into amnesia mode.
- Defaults to ``
- Exposed by the `--focus` CLI argument.

### `MOJO_TEMP_DIR`

- Defines where Mojo will store its temporary files.
- Defaults to `os.tmpdir()` (`/tmp` on Linux most of the time)
- Controlled and exposed by the `--temp-dir` CLI argument.

### `MOJO_RUNNER_PATH`

- Defines where Mojo will store its "runner" file which contains the test file
  listing and is fed to Karma for processing.
- Defaults to `${TEMP_DIR}/mojo-runner.js`
- See `MOJO_TEMP_DIR` for resolving the temp directory.
- Controlled indirectly by the `--temp-dir` CLI argument. You can not currently
  customize the file name, only the directory path.

### `MOJO_CACHE_PATH`

- Defines where Mojo will store its "cache" file for resuming sessions.
- Defaults to `${TEMP_DIR}/mojo-cache.js`
- See `MOJO_TEMP_DIR` for resolving the temp directory.
- Controlled indirectly by the `--temp-dir` CLI argument. You can not currently
  customize the file name, only the directory path.

### `COVERAGE`

- Mojo does not have any custom handling for this option, it is only for
  convenience to expose this variable so that you can configure Karma to run
  with coverage.
- The value will be set to `"1"`.
- Exposed by the `--coverage` CLI argument.

### `VERBOSE`

- Mojo does not have any custom handling for this option, it is only for
  convenience to expose this variable so that you can configure Karma to run
  with increased verbosity.
- The value will be set to `"1"`.
- Exposed by the `--verbose` CLI argument.

## License

This work is licensed under the Affero GPL v3.0 license.

Copyright (c) 2015-present, Instructure Inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.