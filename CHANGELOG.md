# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Added `event.stopPropagation` function allowing to half the event inside a group handler.
- Added `json.parse` handler.
- Added `json.stringify` handler.
- Added `net.fetch` handler.
- Added `os.platform` handler.

### Fixed
- Fixed a typo in the error message shown from the help command when the user tries to show details about a non-existent command.
- Fixed `soybean run` not being able to process arbitrary node arguments such as `--experimental-fetch` without specifying the configuration file.

### Changed
- Set Node engine to 18.x.x for future releases.

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