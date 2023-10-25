# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- Added `shell.spawn()` `symbol` parameter support for the command `string/array`. If an `array` is used to allow command parameters, each of the `array` members also supports `symbols` and `string templates`.
- Added `json.stringify()` support for a `space` parameter, allowing a nicely formatted output.
- Added interval routines support accessible through the `routines` object. Additionally this routine includes a mechanism that will cause the it to stop if it detects too many subsequent errors

### Fixed
- Fixed `forIn()` handler issue that caused the loop that stopped the loop from ever iterating over any object key when a `symbol` was used for reading event object data.

## [0.3.1]

### Fixed
- Fixed `soybean init` command not being able to copy a missing template file.

## [0.3.0]

### Fixed
- Fixed a `Program` class conflict that ocurred when Soybean was initialized with combination of a local configuration file using local modules and a globally installed version.

## [0.2.0]

### Added
- Added `event.stopPropagation` function allowing to half the event inside a group handler.
- Added `json.parse` handler.
- Added `json.stringify` handler.
- Added `net.fetch` handler.
- Added `os.platform` handler.
- Added `forEach` handler.
- Added `forIn` handler.
- Added `forOf` handler.
- Added `e.del()` method for deleting information stored on the event object.
- Added `soybean init [file]` command that lets the user create a boilerplate configuration file.
- Added `passthroughShell` setting status to the `help` command output
- Added support for string templates to all the handler parameters that supported symbols to read data from the event object. Example - Set a variable `who` to `"world"` using `e.set()` and use `"hello {{ who }}!"` instead of a symbol parameter to receive `"hello world!"` in its place programmatically.

### Fixed
- Fixed a typo in the error message shown from the help command when the user tries to show details about a non-existent command.
- Fixed `soybean run` not being able to process arbitrary node arguments such as `--experimental-fetch` without specifying the configuration file.

### Changed
- Set Node engine to 18.x.x for future releases.
- `fs.mkdir` and `fs.rmdir` now accept an optional options parameter (See native [`fs.mkdir`](#https://nodejs.org/api/fs.html#fsmkdirpath-options-callback) documentation)

## [0.1.3]

### Added
- Added launch routines - A list of event handlers to be called upon each launch of Soybean.
- Added watch routines - A list of event handlers called on file-system events, such as moving or writing to a file.
- Added `set` handler.
- Added `update` handler.

## [0.1.2]

### Added
- Added `e.set()`, `e.get()`, `e.update()` and `e.updateAsync()` for storing/reading/updating information on the event object inside of grouped event handlers to enable more complex actions like reading data from the disk, processing files and alike without relying on the `handle` handler.
- Added Symbol parameter support to all `fs` event handlers. If the event object stores a piece of data, the user can now in many cases use `Symbol("key")` to use the information stored in the event instead of hard-coding it, eg. `fs.writeFile('/some/path', Symbol("content"))`
- Added `fs.chmod` handler.
- Added `fs.readFile` handler.
- Added `fs.readdir` handler.

### Fixed
- Fixed command argv issue when spawning child processes that left the command keyword as a separate command argument.
- Fixed double-escape key sequence indenting text and passing unwanted input to the passthrough shell.
- Fixed the `quit` command not emitting the command history log.

### Changed
- All built-in event handlers now emit logs during execution.

## [0.1.1]

### Fixed
- Fixed `npm publish` issues caused by bad `package.json` files list configuration that caused some files to not be published

## [0.1.0]

### Added
- The help message now shows a list of user-specified command handlers.
- Added `shell.spawn` event handler with `stdin` takeover mechanism
- Added `fs.mkdir` handler.
- Added `fs.rmdir` handler.
- Added `fs.rm` handler.
- Added `fs.writeFile` handler.
- Added `fs.copyFile` handler.
- Added `cp.kill` handler.
- Added `cp.restart` handler.
- Added `cp.revive` handler.

### Fixed
- Fixed "indented" exit logs after double-pressing CTRL+C when command input wasn't empty.
- The help message is now a single log and will not intersect with child process logs.

### Removed
- Removed old debug log displaying child process spawn settings.
- Removed `.editorconfig`, `tsconfig.json`, `soybean.config.js` and `CHANGELOG.md` from files published to NPM.

## [0.0.6]

### Fixed
- Fixed scoped exports in `package.json`

## [0.0.5]

### Added
- `./` scoped export for main Soybean program constructor
- `./handlers` scoped export for command and event handlers.

### Changed
- Exports now reside in a separate directory.

## [0.0.4]

### Added
- Child process handling and complete lifecycle.
- Lime terminal feature with support for built-in and custom commands.

## [0.0.1-0.0.3]

### Experimental phase