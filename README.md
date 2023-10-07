
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
- **Specifying custom terminal command handlers** that allow you to run tasks on demand from within Soybean's terminal, along with keeping your command history and passing through unrecognized commands to a system shell like `zsh` or `powershell` - You don't need a separate terminal tab to interact with your OS.

## Table of contents
- [Getting started](#getting-started)


# Getting started
Soybean works on a basis that is followed by many other tools such as `vite` or `tsc`. It is a CLI tool available under the command `soybean` (or `sb` for convenience) that's initialized using a JavaScript configuration file.

## Installation
Soybean is a CLI tool, meaning it has to be installed globally.
```bash
npm install soybean@latest -g
```

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


