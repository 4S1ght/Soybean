# Soybean
Soybean is a convenience multi-tool for tedious task automation.
It lets you set up your compilers, bundlers and the rest of the environment and get to work with a single command.
Write tidy and concise routines executed on a plethora of events, such as a file change or a user-specified command.

# Documentation
- [Installation](#installation)
    - [Configuration](#configuration)

# Installation
Starting out with Soybean is as easy as with any other tool like Vite or Rullup

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
Installing soybean introduces a new command, similarly to `tsc` or `vite`.
To create a new configuration file use `soybean init`

```
soybean init
```

Or 
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

After the file configuration file is created you will be able to run it with
```
soybean run <file>
```
