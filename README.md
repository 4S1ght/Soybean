# Soybean
Soybean is a convenience multi-tool for tedious task automation.
It lets you set up your compilers, bundlers and the rest of the environment and get to work with a single command.
Write tidy and concise routines executed on a plethora of events, such as a file change or a user-specified command.

# Documentation
- [Installation](#installation)
- [Configuration](#configuration)
    - [Child processes](#child-processes)

# Installation
Starting out with Soybean is as easy as with any other tool like Vite or Rullup.

Install Soybean with `npm`:
```
npm install soybean
```

With `yarn`:
```
yarn install soybean
```

**Note:** Soybean is written in TypeScript from the ground up. No external types module is required.

# Configuration
Similar Vite or the TS compiler, Soybean is a CLI tool, that allows you to create a boilerplate configuration file like so:

```
soybean init
```

Or if you would like to specify the path yourself:
```
soybean init ./myConfig.js
```

Alternatively, you can use the shorthand command `sb` instead of `soybean`.

```
sb init
```

The above command will create a new configuration file in the chosen destination.
```js

import { Soybean } from 'Soybean'
import h from 'Soybean/handlers'

export default Soybean({
    cp: {
        node: {
            command: ["node"],
            cwd: "./",
            stdout: "all"
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

After the file configuration file is created you will be able to run soybean with its settings:
```
soybean run <file>
```

# Child processes
One of Soybean's core features is consolidating all your child processes into a single terminal window.
Using the `cp` property in the Soybean config, you can easily set up multiple different instances of compilers, bundlers and different tasks.

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

## Child process configuration options

| Property name | Type | Description |
| ------------- | ---- | ----------- |
| `command` | `string \| Array<string>` | Specifies the command used to spawn the child process. A simple `string` can be used for a bare command, like `tsc` or an `array` to specify the command together with command parameters, eg. `["tsc", "-w", "--strict"]`. |
| `stdout` | `"all" \| "none"` | Specifies whether or not to pipe the child process' `STDOUT`, this will effectively mute the child process if used with `"none"` or display all of it's output if used with `"all"`. |
| `cwd` | `string` | The current working directory of the child process, relative to the Soybean configuration file. |
| `deferNext` | `number` | Time in `ms` for which to wait with further execution after spawning this process. This allows for tricks like spawning a compiler and waiting a second before spawning a different process that relies on the compiler's output. |

The child process' configuration object accepts the above properties, as well as standard options available for `child_process.spawn()`, with exception of `stdio` and `detached`.