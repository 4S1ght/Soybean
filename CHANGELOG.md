# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Added `e.set()`, `e.get()`, `e.update()` and `e.updateAsync()` for storing/reading/updating information on the event object inside of grouped event handlers to enable more complex actions like reading data from the disk, processing files and alike without relying on the `handle` handler.
- Added Symbol parameter support to all `fs` event handlers. If the event object stores a piece of data, the user can now in many cases use `Symbol("key")` to use the information stored in the event instead of hard-coding it, eg. `fs.writeFile('/some/path', Symbol("content"))`
- Added `fs.chmod` handler.
- Added `fs.readFile` handler.

### Fixed
- Fixed command argv issue when spawning child processes that left the command keyword as a separate command argument.
- Fixed double-escape key sequence indenting text and passing unwanted input to the passthrough shell.

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