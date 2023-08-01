
// ==================================================================

import type { SoybeanConfig } from "./types.js"

import ProcessManager from "./process/process_mgr.js"
import Terminal from "./terminal/terminal.js"

// ==================================================================

export default class Program {

    private config: SoybeanConfig
    private processManager: ProcessManager

    private declare cwd: string

    constructor(config: SoybeanConfig) {
        this.config = config
        this.processManager = new ProcessManager(config.cp)
    }

    public async start(cwd: string) {
        this.cwd = cwd
        await this._spawnChildProcesses()
    }

    private async _spawnChildProcesses() {

        if (!this.config.cp) return
        this.processManager.createChildInstances() 

        // Set information messages for child process events
        for (const [name, process] of this.processManager.children) {
            process.on('close',         ()    =>        Terminal.EXIT (`Process "${name}" closed with exit code ${process.ref.exitCode}.`))
            process.on('kill',          ()    =>        Terminal.INFO (`Killed process "${name}".`))
            process.on('kill-error',    (err) =>        Terminal.ERROR(`An error was encountered while attempting to kill "${name}".`, err))
            process.on('restart',       ()    =>        Terminal.INFO (`Restarted process "${name}".`))
            process.on('restart-error', (err) =>        Terminal.ERROR(`An error was encountered while attempting to restart "${name}".`, err))
            process.on('spawn',         ()    =>        Terminal.INFO(`Process "${name}" is running.`))
        }

        await this.processManager.startEach((process) => {
            Terminal.INFO(`Starting "${process.name}"`)
        })
        
    }

}