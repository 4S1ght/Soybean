
// Imports ==========================================================

import type { SoybeanConfig } from "./types.js"

import ProcessManager from "./process/process_mgr.js"
import Terminal from "./terminal/terminal.js"
import LiveTerminal from "./terminal/liveterminal.js"
import { TerminalEvent } from "./events/events.js"
import commands from "./terminal/liveterminal_commands.js"

// Exports ==========================================================

export default class Program {

    private static instance: Program
    public static getLiveInstance = () => this.instance

    public config: SoybeanConfig
    private processManager: ProcessManager
    private liveTerminal: LiveTerminal

    private declare cwd: string

    constructor(config: SoybeanConfig) {
        this.config = config
        this.processManager = new ProcessManager(config.cp)
        this.liveTerminal = new LiveTerminal(config.terminal)
        Program.instance = this
    }

    public async start(cwd: string) {
        this.cwd = cwd
        await this._spawnChildProcesses()
        await this._setupTerminal()
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

    private async _setupTerminal() {
        
        this.liveTerminal.on('exit', () => this.shutdown())

        // Load command handlers that react to the user typing in a command in the live terminal.
        if (this.config.terminal?.handlers)
        for (const command in this.config.terminal.handlers) {
            if (Object.prototype.hasOwnProperty.call(this.config.terminal.handlers, command)) {

                const handler = this.config.terminal.handlers[command]

                this.liveTerminal.on(command, async (...argv: string[]) => {
                    const event = new TerminalEvent(argv)
                    const error = await handler(event)
                    if (error) Terminal.ERROR('An error was encountered while performing operation:', error)
                })

            }
        }

        // Load built-in command handlers
        // This overrides user-specified handlers.
        for (const command in commands) {
            if (Object.prototype.hasOwnProperty.call(commands, command)) {

                const handler = commands[command]

                if (this.liveTerminal.eventNames().includes(command)) {
                    Terminal.WARN(`Terminal handler "${command}" was overwritten due to name conflict with an internal or built-in command.`)
                    this.liveTerminal.removeAllListeners(command)
                }

                this.liveTerminal.on(command, async (...argv: string[]) => {
                    const event = new TerminalEvent(argv)
                    const error = await handler(event)
                    if (error) Terminal.ERROR('An error was encountered while performing operation:', error)
                })

                
            }
        }
        
        this.liveTerminal.start()

    }

    public async shutdown() {

        const start = Date.now()
        Terminal.EXIT("Closing Soybean gracefully.")

        if (this.processManager) {
            const error = await this.processManager.closeAll()
            if (error) Terminal.ERROR('[kill phase] An error had occurred while attempting a graceful shutdown:', error)
        }

        Terminal.EXIT(`Stopped. (${Date.now() - start}ms)`)
        process.exit()

    }

}