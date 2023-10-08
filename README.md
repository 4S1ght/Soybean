
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


# Getting started
Soybean works on a basis that is followed by many other tools such as `vite` or `tsc`. It is a CLI tool available under the command `soybean` (or `sb` for convenience) that's initialized using a JavaScript configuration file.

## Installation
Soybean is a CLI tool, meaning it has to be installed globally.

1. Install globally
    ```bash
    npm install soybean@latest -g
    ```

2. Install locally.  
    Alternatively, if you only need Soybean for a single project, you can install it locally and run it through an npm script.
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

Although having all your processes print out to the same terminal might seem messy at first, it saves lots of time switching between terminal windows/tabs looking at possible issues.
This also lets you spot any problems at an instant instead.

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
| `command` | `string \| Array<string>` | Specifies the command used to spawn the child process. A simple `string` can be used for a bare command, like `tsc` or an `array` to specify the command together with command parameters, eg. `["tsc", "-w", "--strict"]`. |
| `stdout` | `"all" \| "none"` | Specifies whether or not to pipe the child process' `STDOUT`, this will effectively mute the child process if used with `"none"` or display all of it's output if used with `"all"`. |
| `cwd` | `string` | The current working directory of the child process, relative to the Soybean configuration file. |
| `deferNext` | `number` | Time in `ms` for which to wait with further execution after spawning this process. This allows for tricks like spawning a compiler and waiting a second before spawning a different process that relies on the compiler's output. |

The child process' configuration object accepts the above properties, as well as standard options available for `child_process.spawn()` such as `shell` or `signal`, with exception of `stdio` and `detached` which were disabled due to how soybean operates.