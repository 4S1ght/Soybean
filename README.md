
<!-- Back to top target element -->
<a name="readme-top"></a>

<h1 align="center">Soybean</h1>

<!-- Project splash screen -->

<p align="center">
    <img src="./docs/img/launch_sequence_intro.png" title="Project splash screen" alt="Project splash screen">
<p>

## About the project
Soybean is an automation multi-tool that started as a simple script to ease the annoying process of spawning multiple compilers, frameworks and other CLI tools and constantly restarting them manually each time part of the code or configuration has changed.

Now Soybean is capable of:
- **Spawning and managing multiple child processes** such as compilers and frameworks from within a single terminal window - No more switching between terminal tabs to see what's broken.
- **Running automated tasks**, or "routines" based on events that happen as you do your work - Fetch the remote at the start of your work, restart your app on `.env` file change or run a shell command in an interval.
- **Letting you specify custom terminal command handlers** that allow you to run tasks on demand from within Soybean's terminal, along with keeping your command history and passing through unrecognized commands to a system shell like `zsh` or `powershell` - You don't need a separate terminal tab to interact with your OS.

## Table of contents
- [Getting started](#getting-started)
- [Configuration](#configuration)
    - [Child processes](#child-processes-configuration)
        - [Child process config options](#child-process-configuration-options)
    - [Routines](#routines)
        - [Launch routines](#launch-routines)
        - [Watch routines](#watch-routines)
            - [Watch routines config option](#watch-routines-configuration-options)
- [Modules](#modules)
    - [Event handlers](#handlers-module)


# Getting started
Soybean works on a basis that is followed by many other tools such as `vite` or `tsc`. It is a CLI tool available under the command `soybean` (or `sb` for convenience) that's initialized using a JavaScript configuration file.

## Installation
Soybean is a CLI tool, meaning it has to be installed globally to be accessible through shell.

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
Soybean by its design requires a configuration file that stores all of its settings used inside your project.

Create a new configuration file.
```bash
soybean init <file?>
```
The above command will create a boilerplate JavaScript config file as seen below.
```js
import { Soybean } from 'Soybean'
import h from 'Soybean/handlers'

export default Soybean({
    cp: {
        node: {
            command: ['node'],
            cwd: './',
            stdout: 'all'
        }
    },
    routines: {
        launch: [
            h.handle(() => console.log("Everything set up!"))
        ],
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
        // And set up a yet another process
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
| `command` | `string \| Array<string>` | Specifies the command used to spawn the child process. A simple `string` can be used for a bare command, like `tsc` or `vite` and an `Array<string>` to specify the command together with command parameters, eg. `["tsc", "-w", "--strict"]`. |
| `stdout` | `"all" \| "none"` | Specifies whether or not to pipe the child process' `STDOUT`, this will effectively mute the child process if used with `"none"` or display all of it's output if used with `"all"`. |
| `cwd` | `string` | The current working directory of the child process, relative to the Soybean configuration file. |
| `deferNext` | `number` | Time in `ms` for which to wait with further execution after spawning this process. This allows for tricks like spawning a compiler and waiting a second before spawning a different process that relies on the compiler's output. |

The child process' configuration object accepts the above properties, as well as standard options available for `child_process.spawn()` such as `shell` or `signal`, with exception of `stdio` and `detached` which were either disabled or altered due to how soybean operates.

# Routines
Routines are small pieces of code executed based on events that happen as you work on your project, such us when you modify a file or type a command in the terminal.

Routines use Soybean's the [event handlers module](#event-handlers), a set of predefined methods to build tidy, easy to write procedures, such as moving a file, restarting a child process or calling a custom callback with your code.

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
| `handle`              | `Function`    | -     | The event handler called whenever a watch event is fired. |
| `options.rateLimiter` | `number`      | `500` | The amount of time in milliseconds to wait after a watch event before the next one can be registered. |

The `options` object also accepts native [fs.watch](https://nodejs.org/docs/latest/api/fs.html#fswatchfilename-options-listener) options - `encoding`, `persistent`, `recursive` and `signal`.

# Modules
## Event handlers