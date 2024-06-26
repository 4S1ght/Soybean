
<!-- Back to top target element -->
<a name="readme-top"></a>

<h1 align="center">Soybean</h1>

<!-- Project splash screen -->

<p align="center">
    <img src="./docs/img/launch_sequence_intro.png" title="Project splash screen" alt="Project splash screen">
<p>

# Project on hold!
This project is currently on hold due to terminal and child process issues that can not be fixed without the use of native modules.
Soybean will be completely rewritten in the future.

## About the project
Ever had to work on a complicated project, using multiple tools, compilers, bundlers, manually restart things or move a file from one place to another each time a tiny thing has changed?

Soybean started as a simple script to ease the annoying process of dealing with these sorts of things and evolved into an automation multi-tool.

As of now Soybean is capable of:
- **Spawning and managing multiple child processes** such as compilers and frameworks from within a single terminal window - No more switching between terminal tabs to see what's broken.
- **Running automated tasks**, or "routines" based on events that happen as you do your work - Fetch the remote at the start of your work, restart your app on `.env` file change or run a shell command in an interval.
- **Running custom handlers from the terminal** that allow you to easily run quick tasks, input and manipulate data such as local variables, along with keeping your command history and passing through unrecognized commands to a system shell like `zsh` or `powershell` - You don't need a separate terminal tab to interact with your OS.

## Table of contents
- [Getting started](#getting-started)
- [Configuration](#configuration)
    - [Child processes](#child-processes-configuration)
        - [Child process configuration options](#child-process-configuration-options)
    - [Routines](#routines)
        - [Launch routines](#launch-routines)
        - [Watch routines](#watch-routines)
            - [Watch routines configuration options](#watch-routines-configuration-options)
    - [Integrated terminal](#integrated-terminal)
            - [Terminal configuration options](#terminal-configuration-options)

- [Modules](#modules)
    - [Event handlers](#event-handlers-module)
        - [Event object](#event-object)
        - [Symbols](#using-symbols)
        - [Miscellaneous handlers](#misc-handlers)
            - [`handle()`](#handle)
            - [`group()`](#group)
            - [`wait()`](#wait)
            - [`set()`](#set)
            - [`update()`](#update)
            - [`forEach()`](#foreach)
            - [`forOf()`](#forof)
            - [`forIn()`](#forin)
        - [File system](#fs-handlers)
            - [`fs.mkdir()`](#fsmkdir)
            - [`fs.readdir()`](#fsreaddir)
            - [`fs.rmdir()`](#fsrmdir)
            - [`fs.rm()`](#fsrm)
            - [`fs.readFile()`](#fsreadfile)
            - [`fs.writeFile()`](#fswritefile)
            - [`fs.copyFile()`](#fscopyfile)
            - [`fs.chmod()`](#fschmod)
        - [Child process](#cp-handlers)
            - [`cp.kill()`](#cpkill)
            - [`cp.revive()`](#cprevive)
            - [`cp.restart()`](#cprestart)
        - [Shell](#shell-handlers)
            - [`shell.spawn()`](#shellspawn)
        - [JSON](#json)
            - [`json.parse()`](#jsonparse)
            - [`json.stringify()`](#jsonstringify)
        - [Network](#network-handlers)
            - [`net.fetch()`](#netfetch)
        - [Os](#os-handlers)
            - [`os.platform()`](#osplatform)
        

# Getting started
Soybean works on a basis that similar to many other tools such as `vite` or `tsc`. It is a CLI tool available under the command `soybean` (or `sb` for convenience) that's initialized using a JavaScript configuration file.

## Installation
Soybean is a CLI tool, meaning it has to be installed globally to be accessible through user shell.

1. Install globally
    ```bash
    npm install soybean@latest -g
    ```

2.  Alternatively, if you only need Soybean for a single project, you can install it locally and run it through an npm script.
    ```bash
    npm install soybean@latest --save-dev
    ```

    Inside of `package.json`:
    ```json
    {
        "scripts": {
            "soybean": "soybean run ./soybean.config.js"
        }
    }
    ```

# Configuration
Soybean by design requires a configuration file that stores all of its settings used inside your project.

Create a new configuration file.
```bash
soybean init [file]
```
The above command will create a boilerplate JavaScript config file as seen below.
```js
import { Soybean, handlers } from 'Soybean'

export default Soybean({
    cp: {},
    routines: {
        launch: [],
        watch: []
    },
    terminal: {
        passthroughShell: false,
        keepHistory: 50,
        handlers: {}
    }
})
```

## Child processes configuration
One of Soybean's core features is consolidating all your processes into a single terminal window.
Using the `cp` object in the Soybean config, you can easily set up multiple different instances of compilers, bundlers and different tasks.

Although having all your processes print out to the same terminal might seem messy at first, it saves lots of time switching between terminal windows/tabs looking at possible issues. Instead, everything can be spotted at an instant.

```js
Soybean({
    cp: {
        // Specify a child process' name
        typescript: {
            // Specify the spawn command
            command: ["tsc", ''],
            // And the CWD
            cwd: "./src" 
        },
        // Set up another process...
        static: {
            command: "http-server",
            cwd: "./dist" 
        }
    }
})
```

### Child process configuration options

| Property name | Type | Description |
| ------------- | ---- | ----------- |
| `command` | `string\|string[]` | Specifies the command used to spawn the child process. A simple `string` can be used for a bare command, like `tsc` or `vite` and an `string[]` to specify the command together with command parameters, eg. `["tsc", "-w", "--strict"]`. |
| `stdout` | `"all"\|"none"` | Specifies whether or not to pipe the child process' `STDOUT`, this will effectively mute the child process if used with `"none"` or display all of it's output if used with `"all"`. |
| `cwd` | `string` | The current working directory of the child process, relative to the Soybean configuration file. |
| `deferNext` | `number` | Time in `ms` for which to wait with further execution after spawning this process. This allows for tricks like spawning a compiler and waiting a second before spawning a different process that relies on the compiler's output. |
| `onSpawn` | `EventHandler` | An event handler called whenever the process is spawned. |
| `onKill` | `EventHandler` | An event handler called whenever the process is killed by the user, so either through the terminal using the `kl` command or by another `cp.kill` event handler. |
| `onClose` | `EventHandler` | An event handler called whenever the process quits on its own. |

The child process' configuration object accepts the above properties, as well as standard options available for [`child_process.spawn()`](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options) such as `shell` or `signal`, with exception of `stdio` and `detached` which were either disabled or altered due to how soybean operates.

# Routines
Routines are small pieces of code executed based on events that happen as you work on your project, such us when you modify a file or type a command in the terminal.

Routines use Soybean's [event handlers module](#event-handlers-module), a set of predefined methods to build tidy, easy to write procedures, such as moving a file, restarting a child process or calling a custom callback with your own code.

## Launch routines
Launch routines are really simple. All they do is run exactly once when soybean is spawned. This is useful when you want to prepare things before starting your work, such as fetching the remote.

```js
Soybean({
    routines: {
        launch: [
            // Run "git fetch" on startup
            handlers.shell.spawn(['git', 'fetch'])
        ]
    }
})
```

The above code will result in `git fetch` being called once each time Soybean is started:

<img src="./docs/img/routine_launch.png" align="center" alt="Launch routine" title="Launch routine"/>

## Watch routines
Watch routines are executed based on events coming from the file system, such as when you update a file, move it or delete it. They are especially useful when you can't use solutions like [Nodemon](https://www.npmjs.com/package/nodemon) and you would like to restart a program on file change.

```js
Soybean({
    routines: {
        watch: [
            {
                // Watch directory.txt
                file: './my/file/or/directory.txt',
                // Restart "my-program" when the file changes
                handle: handlers.cp.restart('my-program'),
                // Watch options
                options: { 
                    rateLimiter: 500 
                }
            }
        ]
    }
})
```

### Watch routines configuration options
| Property name | Type | Default value | Description |
| ------------- | ---- | ------------- | ----------- |
| `file`                | `string`      | -     | The target file or directory path that is being watched. |
| `handle`              | `Function`    | -     | The [event handler](#handlers-module) called whenever a watch event is fired. |
| `options.rateLimiter` | `number`      | `500` | The amount of time in milliseconds to wait after a watch event before the next one can be registered. |

The `options` object also accepts native [fs.watch](https://nodejs.org/docs/latest/api/fs.html#fswatchfilename-options-listener) options - `encoding`, `persistent`, `recursive` and `signal`.

# Integrated terminal
Soybean's integrated terminal lets you interact with the program while it's running.
Alongside a few built-in commands, you're able to specify [your own](#event-handlers-module) command handlers.

```js
Soybean({
    terminal: {
        // Keep the history of the last 50 commands and save it across sessions.
        keepHistory: 50,
        // Use a passthrough shell to pass "through" unrecognized commands to.
        passthroughShell: true,
        // Add a "change" to let the used change `myVar` on the fly.
        handlers: {
            change: handlers.handle(e => {
                // Change some variable
                myVar = e.argv[0]
                // Update the settings of an external tool or library...
                someTool.updateState(`new state: ${e.argvRaw}`)
            })
        }
    }
})
```

## Terminal configuration options
| Property name | Type | Default value | Description |
| ------------- | ---- | ------------- | ----------- |
| `passthroughShell` | `string\|boolean` | `false` | The passthrough shell used to execute commands that are unrecognized by Soybean itself, such as `mkdir`, `sudo`, etc... Use `false` to disable, `true` to use the default system shell, or a `string`, such as `"/bin/zsh"` or `"cmd.exe"` to use a specific shell. |
| `keepHistory` | `number` | `0` | The number specifying how many previous commands to remember across sessions. These commands will be remembered by the global/local (depending on user setup) installation of Soybean even if the program is closed and reopened again. |
| `handlers` | `Record<string, EventHandler>` | - | An object containing user-specified command handlers. |

# Modules

# Event handlers module
The handlers module is a set of methods that allow you to configure event handlers that react events that occur in Soybean during your work. They happen when you save a file, type a command or as you launch Soybean itself.

```ts
import { handlers } from 'soybean'
```

## Event object
Each time an event handler is called in Soybean, a new event object is created containing the information about the event that ocurred.

The different types of events include:

- `SoybeanEvent` - The default object whose properties and information are available to every event handler used. All of the event objects below extend the `SoybeanEvent` class.
    - `SoybeanEvent.source` - The source of the event, which, depending on where it originated from can be one of - `"event"` (Default value), `"terminal"`, `"launch"`, `"watcher"`.
    - `SoybeanEvent.set()` - A method used to store data on the event object, which can then be retrieved and used later by a subsequent event handler inside a [handler group](#group).
        ```ts
        event.set(key: string, data: any)
        ```
        Alternatively, it is possible to read properties directly (Only available as read-only. It isn't possible to **set** data this way).
        ```ts
        event.get('key') | event.key |  event["key"]
        ```
    - `SoybeanEvent.get()` - Used to retrieve a piece of data set on the event object with `set()`.
        ```ts
        event.get(key: string)
        ```
    - `SoybeanEvent.update()` - Used to update the value of an item stored on the event object with `set()`. It accepts a callback function used to process the variable and **return it** to be saved.
        ```ts
        event.update(key: string, callback: (data: any) => any)
        ```
    - `SoybeanEvent.updateAsync()` - The equivalent of the `update()` method used for asynchronous information.
        ```ts
        event.updateAsync(key: string, callback: (data: any) => Promise<any>)   
        ```
- `WatchEvent` - The event emitted by [watch routines](#watch-routines).
    - `WatchEvent.filename` (`string`) - Path to the file/directory where the event originated.
    - `WatchEvent.watchEventType` (`"rename" | "change"`) - The type of change.

- `TerminalEvent` - Event emitted when a user-specified command is entered in the integrated terminal.
    - `WatchEven.argv` (`string[]`) - An array of space-separated command parameters passed after the command keyword.
    - `WatchEven.argvRaw` (`string`) - The raw string of text passed after the command keyword.

- `ChildProcessEvent` - Event emitted by a child process when it's killed, revived, restarted or dies unexpectedly, configurable through [child process options](#child-process-configuration-options).
    - `ChildProcessEvent.processName` (`string`) - The name of the process that triggered the event.
    - `ChildProcessEvent.exitCode` (`number | null`) - The exit code returned by the child process, if the event originated from the process' death.

## Using symbols
Many of the event handlers allow you to replace their regular parameters with `symbols` which are used to make the values of these parameters dynamic, as opposed to hardcoding them.

Any time a handler supporting symbol parameters is passed a symbol, it will read its description and use it as a key. This key is then used to fetch any data living on the event object and use it in place of the parameter.

**Example:**  
```ts
fs.mkdir('./my/directory/')
```
```ts
group([
    // Do some setup and save a "my-dir" variable.
    ...,
    // Use the "my-dir" variable to choose the directory path dynamically.
    fs.mkdir(Symbol('my-dir'))
])
```

Additionally, for string parameters that support dynamic values with the use of `symbols`, string templates can be used instead:
```ts
group([
    // Set a "my-dir" variable.
    ...,
    // Then u it within a string parameter:
    fs.mkdir('./path/to/{{ my-dir }}/')
])
```

## Miscellaneous handlers

### `handle()`
The `handle` event handler uses a traditional callback function to allow you to perform any kind of action not possible with Soybean's built-in handlers.

Additionally it has access to the [event object](#event-object) which allows it to interact with data shared with other handlers within the same [event group](#group).
```ts
handle(event: SoybeanEvent, callback: EventHandler)
```
<details>
<summary>Code snippet</summary>

```ts
handle(e => {
    const data = getSomeData()
    e.set('data', data)
})
```

</details>

### `group()`
The `group` handler allows you to group multiple handlers and share data between them.
This lets you create complex routines that perform a set of tasks on each event.

Inside of groups the event object includes an additional method `stopPropagation()` which lets you stop the group's execution when called.
```ts
group(handlers: EventHandler[])
```
<details>
<summary>Code snippet</summary>

```ts
group([
    // Read a file
    fs.readFile('./src/myConfig.json', 'my-config', 'utf-8'),
    // Parse it & save to "my-parsed-config"
    json.parse('my-config', 'my-parsed-config'),
    // Log it to the console
    handle(e => {
        console.log(event.get('my-parsed-config'))
    })
])

```
</details>

### `wait()`
The `wait` event handler lets you create a time gap inside a handler group.
```ts
wait(time: number)
```
<details>
<summary>Code snippet</summary>

```ts
group([
    handle(e => { event.set('start', Date.now()) }),
    wait(1000),
    // Logs out "1000"
    handle(e => { console.log(Date.now() - e.get('start')) })
])
```

</details>

### `set()`
The `set` handler is used to set a property on the event object inside a handler group.
It is effectively a shorthand for `event.set` inside a `handle` event handler.
```ts
set(key: string, data: any)
```
<details>
<summary>Code snippet</summary>

```ts
group([
    set('config', fs.readFileSync('./config.js')),
    handle(e => console.log(e.get('config')))
])
```

</details>

### `update()`
The `update` handler is a shorthand for `event.update` & `event.updateAsync`.
It lets you quickly update a piece of information saved on the event object.
```ts
update(key: string, callback: (data: any) => any)
```
<details>
<summary>Code snippet</summary>

```ts
group([
    set('config', fs.readFileSync('./config.yaml')),
    update('config', (config) => {
        return YAML.parse(config)
    })
])
```

</details>

### `forEach()`
Loops over an array or string. Accepts direct reference or a symbol with a description matching the key to read from the event object.

Exposes `event.break` and `event.continue` methods to manage the loop's operation. All of them accept an ID to target a specific loop

Inside `forEach` loops, three items are available through `get()` on the event object:
- `"array"` - The array that the loop is iterating over.
- `"index"` - The current array index inside the loop.
- `"value"` - The current value from the array the loop is iterating over.

**Note:** If the loop has an ID set, all the above properties will be prefixed with its ID.  
Eg. For a loop labeled as `"loop1"`, the `"value"` property would be changed to `"loop1-value"`. This lets you nest loops and groups inside each other without variable naming conflicts.

```ts
forEach(iterable: symbol | any[], handler: EventHandler)
forEach(iterable: symbol | any[], id: string, handler: EventHandler)
```
<details>
<summary>Code snippet</summary>

```ts
forEach([1, 2, 3, 4, 5], handle(e => {
    console.log(e.get('value'))
}))
```
```ts
group([
    set('my-array', [1, 2, 3, 4, 5]),
    forEach(Symbol("my-array"), handle(e => {
        console.log(e.get('value'))
    }))
])
```

</details>

### `forOf()`
Loops over an iterable object or array. Accepts an iterable object  or a symbol with a description matching the key to read from the event object.

Exposes `event.break` and `event.continue` methods to manage the loop's operation. All of them accept an ID to target a specific loop

Inside `forOf` loops, two items are available through `get()` on the event object:
- `"object"` - The object that the loop is iterating over.
- `"value"` - The current value read from the iterated object.

**Note:** If the loop has an ID set, all the above properties will be prefixed with its ID.  
Eg. For a loop labeled as `"loop1"`, the `"value"` property would be changed to `"loop1-value"`. This lets you nest loops and groups inside each other without variable naming conflicts.

```ts
forOf(iterable: symbol | Iterable, handler: EventHandler)
forOf(iterable: symbol | Iterable, id: string, handler: EventHandler)
```
<details>
<summary>Code snippet</summary>

```ts
forOf([1, 2, 3, 4, 5], handle(e => {
    console.log(e.get('value'))
}))
```
```ts
group([
    set('values', [1, 2, 3, 4, 5])
    forOf(Symbol('values'), handle(e => {
        console.log(e.get('value'))
    }))
])
```

</details>

### `forIn()`
Loops over enumerable string properties of an object. Accepts an enumerable object or a symbol with a description matching the key to read from the event object. 

Exposes `event.break` and `event.continue` methods to manage the loop's operation. All of them accept an ID to target a specific loop

Inside `forIn` loops, three items are available through `get()` on the event object:
- `"object"` - The reference to the object being looped over.
- `"key"` - The current object key inside the loop.
- `"value"` - The current value read from the object.

**Note:** If the loop has an ID set, all the above properties will be prefixed with its ID.  
Eg. For a loop labeled as `"loop1"`, the `"value"` property would be changed ro `"loop1-value"`. This lets you nest loops and groups inside each other without variable naming conflicts.

```ts
forIn(iterable: symbol | Record<any, any>, handler: EventHandler)
forIn(iterable: Record<any, any>, id: string, handler: EventHandler)
```
<details>
<summary>Code snippet</summary>

```ts
forIn({ a: 1, b: 2, c: 3 }, handle(e => {
    console.log(e.get('value'))
}))
```
```ts
group([
    set('values', { a: 1, b: 2, c: 3 })
    forIn(Symbol('values'), handle(e => {
        console.log(e.get('value'))
    }))
])
```

</details>

## FS handlers

### `fs.mkdir()`
Used to create a new directory.
Accepts either a `string` path or a `symbol` with a description matching a key to read from the event object in place of the text path.

```ts
fs.mkdir(path: string | symbol, options: MkdirOptions)
```
<details>
<summary>Code snippet</summary>

```ts
fs.mkdir('./relative/to/soybean-config/')
```
```ts
group([
    set('path', './some/path')
    fs.mkdir(Symbol('some-path'))
])
```

</details>

### `fs.readdir()`
Reads the contents of a directory and saves it on the event object.
Accepts a `string` path or a `symbol` with a description matching a key to read from the event object in place of the path, a `string` which is used to save the results on the event object and read options the same as in the native [`fs.readdir`](https://nodejs.org/api/fs.html#fsreaddirpath-options-callback).
```ts
fs.readdir(path: string | symbol, saveTo: string, options?: ReaddirOptions)
```
<details>
<summary>Code snippet</summary>

```ts
group([
    fs.readdir('./relative/to/soybean-config/', 'my-dir'),
    handle(e => console.log(e.get('my-dir')))
])
```

</details>

### `fs.rmdir()`
Removes a directory.
Accepts a `string` path or a `symbol` with a description matching a key to read from the event object and an options object (see native [`fs.rmdir`](https://nodejs.org/api/fs.html#fsrmdirpath-options-callback) options).

```ts
fs.rmdir(path: string | symbol, options?: RmdirOptions)
```
<details>
<summary>Code snippet</summary>

```ts
fs.rmdir('./path/to/remove', { recursive: true })
```
```ts
group([
    set('path', './my/path/'),
    fs.rmdir(Symbol('path'))
])
```

</details>

### `fs.rm()`
Removes a file or directory.
Accepts a `string` path or a `symbol` with a description matching the key to read from the event object and an options object same as in native [`fs.rm`](https://nodejs.org/api/fs.html#fsrmpath-options-callback).

```ts
fs.rm(path: string | symbol, options>: RmOptions)
```
<details>
<summary>Code snippet</summary>

```ts
fs.rm('./my/path.txt', { force: true })
```

</details>

### `fs.readFile()`
Reads the contents of a file and saves it on the event object to be later used inside another handler.
Accepts a `string` path or `symbol` with a description matching the key to read from the event object and a string `key` used to save the file data on the event object.
```ts
fs.readFile(path: string | symbol, saveTo: string, options?: ReadFileOptions)
```
<details>
<summary>Code snippet</summary>

```ts
group([
    fs.readFile('./my/config.txt', 'my-config', { encoding: 'utf-8' }),
    handle(e => console.log(e.get('my-config')))
])
```

</details>

### `fs.writeFile()`
Writes data to a file.
Accepts a `string` file path or `symbol` with a description matching the key to read from the event object, content which can be a `Stream`, `ArrayBuffer`, `string` and many others, including a `symbol` similarly to the path parameter. An optional `options` object is also accepted (See the native [`fs.writeFile`](https://nodejs.org/api/fs.html#fswritefilefile-data-options-callback) documentation).
```ts
fs.writeFile(path: string | symbol, content: string | ..., options?: WriteFileOptions)
```
<details>
<summary>Code snippet</summary>

```ts
fs.writeFile('./my/file.txt', 'My file content!', 'utf-8')
```
```ts
group([
    set('my-content', 'My file content!'),
    fs.writeFile('./my/file.txt', Symbol('my-content'), { encoding: 'utf-8' })
])
```

</details>

### `fs.copyFile()`
Copies a file from `src` to `dest`.
`src` and `dest` both support regular `strings` and `symbols`. The symbols must have descriptions matching keys to read from the event object. Additionally a `mode` parameter is accepted letting you specify access permissions. See native [`fs.copyFile`](https://nodejs.org/api/fs.html#fscopyfilesrc-dest-mode-callback) for more information.
```ts
fs.copyFile(src: string | symbol, dest: string | symbol, mode?: number)
```
<details>
<summary>Code snippet</summary>

```ts
fs.copyFile('./src/file.txt', './dest/file.txt', constants.COPYFILE_EXCL)
```
```ts
group([
    set('src', './src/file.txt'),
    set('dest', './dest/file.txt'),
    fs.copyFile('{{src}}', '{{dest}}')
])
```
</details>

### `fs.chmod()`
Changes access permissions of a file or directory.
Accepts a `string` path or `symbol` with a description matching the key to read from the event object and `mode` parameter specifying the item's permissions. See native [`fs.chmod`](https://nodejs.org/api/fs.html#fsfchmodfd-mode-callback) for more information.
```ts
fs.chmod(src: string | symbol, mode: number)
```
<details>
<summary>Code snippet</summary>

```ts
fs.chmod('./path/to/file.js', 0o400)
```
</details>

## CP Handlers
Handlers for child process management.  
Use them for managing the lifecycle of your child processes, like restarting a child process when a config file it depends on is changed, or when you need to reset their state completely before different actions.

### `cp.kill()`
Kills a child process of a given name if it's alive.  
**Note**: Use the `pcs` command in the integrated terminal to check the process' status.
```ts
cp.kill(process: string | symbol)
```

### `cp.revive()`
Revives a dead child process of a given name if it's dead.  
**Note**: Use the `pcs` command in the integrated terminal to check the process' status.
```ts
cp.revive(process: string | symbol)
```

### `cp.restart()`
Restarts a child process of a given name.  
Unlike `cp.kill` and `cp.revive`, `cp.restart` works no matter if the child process is alive or dead. If it's dead, it will simply be revived, if it's alive, it will be killed and brought back.
```ts
cp.restart(process: string | symbol)
```

## Shell handlers

### `shell.spawn()`
Spawns a temporary child process using the specified command.  
Accepts a `string` command and an `options` object - An altered version of the options object used by Node's native [`cp.spawn`](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options).

```ts
shell.spawn(command: string | string[], options?: SpawnOptions)
```
<details>
<summary>Code snippet</summary>

```ts
// Spawn TSC and compile some code
shell.spawn('tsc')
// Spawn TSC with custom parameters
shell.spawn(['tsc', '--outDir', './dest/'])
// Spawn the process muted
shell.spawn(['tsc', '--outDir', './dest/'], { stdio: 'none' })
```

</details>
<br/>

The altered `options` object properties for the `shell.spawn` handler include:
- `stdio`
    - `"all"` (default) - Pipes `stdout` and `stderr` to the terminal.
    - `"none"` - Mutes the entire process.
    - `"takeover"` - Temporarily takes over the terminal's output **and** input, letting you interact with the spawned process until it dies.
    

## JSON handlers
Handlers used primarily for parsing JSON data, whether for manipulating files or parsing fetch request bodies.

### `json.parse()`
Parses a JSON string.  
Accepts a string `key` used to read the data from the event object and optionally a `saveTo` key, which is used to save the parsed data onto the event object. If `saveTo` is not provided then the parsed information will be saved back under the same `key` it was read from.

Additionally, in rare instances where it's needed, a [`replacer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#reviver) function can be provided for custom parsing directives.

```ts
json.parse(key: string, saveTo?: string, replacer?: Function) 
(+3 overloads)
```

<details>
<summary>Code snippet</summary>

```ts
group([
    // Get some data
    set('src', `{ "some": ["data"] }`),
    // Parse the data and save it to `dest`
    json.parse('src', 'dest'),
    // Read the data
    handle(e => console.log(e.get('dest')))
])
```
</details>

### `json.stringify()`
Stringifies an object into a string.  
Accepts a string `key` to read the data from the event object and optionally a `saveTo` key, which is used to save the resulting string back on the event object. If `saveTo` is not provided then the string will be saved back under the same `key` it was read from.

Additionally, in rare instances where it's needed, a [`replacer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#replacer) function can be provided for custom parsing directives, otherwise an optional `space` setting is used to specify spaces or tabs used for pretty formatting.

```ts
json.stringify(key: string, saveTo?: string, replacer?: Function, space?: number|string) 
(+5 overloads)
```

<details>
<summary>Code snippet</summary>

```ts
group([
    // Get some data
    set('data', { some: ["data"] }),
    // Stringify the object and update the `data` variable
    json.stringify('data'),
    // Read the data
    handle(e => console.log(e.get('data')))
])
```
</details>

## Network handlers
Network handlers let you make network requests, ping servers, fetch information, etc.

### `net.fetch()`
Makes a network request using the fetch API.  
Accepts `string` network address and an `init` object containing all the configuration, such as request type, headers, etc.

Additionally, besides the usual [fetch request options](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options), the `init` object accepts a `cb` callback function which can be used to access the response and interact with the event object.

```ts
net.fetch(input: RequestInfo, init?: RequestInit)
```

<details>
<summary>Code snippet</summary>

```ts
net.fetch('https://github.com', {
    method: "GET",
    headers: { "Content-Type": "text/html" },
    cb: async (res, event) => {
        // Parse the body
        const body = await res.text()
        // Save the body on the event object
        // to further process it in the next event handler.
        event.set('response', body)
    }
})
```
</details>

## OS handlers
Operating system handlers that let you interact with the OS.

### `os.platform()`
Runs the callback event handler only if Node's native `process.platform`'s value 
matches at least one name in specified by the `platform` parameter.

```ts
os.platform(platform: string, handler: EventHandler)
```

<details>
<summary>Code snippet</summary>

```ts
handlers.os.platform('darwin|linux', handlers.handle(event => {
    console.log("We're running on MacOS or Linux!")
}))
```
</details>

