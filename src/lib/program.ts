
// Imports ==========================================================

import fs from 'fs'
import path from 'path'
import c from 'chalk'

import type { SoybeanConfig } from "./types.js"

import * as constants from '../constants.js'
import ProcessManager from "./process/process_mgr.js"
import Terminal from "./terminal/terminal.js"
import LiveTerminal from "./terminal/liveterminal.js"
import { SoybeanEvent, LaunchEvent, TerminalEvent, WatchEvent, ChildProcessEvent } from "./events/events.js"
import commands from "./terminal/liveterminal_commands.js"

import * as url from 'url'
import { kMaxLength } from 'buffer'
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

// Helpers ==========================================================

const createRateLimiter = (time: number) => {
    let lastRun = 0
    function executor(callback: Function) {
        const now = Date.now()
        if (now > lastRun + time) {
            lastRun = now
            callback()
        }
    }
    return executor
}

interface BreakerConfig {
    cooldown: number
    threshold: number
    onBreak: Function
    onTrigger: Function
}
const createBreaker = ({ cooldown, threshold, onBreak, onTrigger }: BreakerConfig) => {
    let runCount = 0
    function trigger() {
        runCount++
        if (runCount > threshold) onBreak()
        else onTrigger()
        setTimeout(() => runCount = 0, cooldown * threshold + cooldown * 0.9)
    }
    return trigger
}

// Exports ==========================================================

export default class Program {
    
    public $$SOYBEAN_RELEASE = constants.RELEASE_VERSION

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
        await this._runWatchRoutines()
        await this._runLaunchRoutines()
        await this._runIntervalRoutines()
        await this._spawnChildProcesses()
        await this._setupTerminal()
    }

    private async _runWatchRoutines() {

        if (this.config.routines && this.config.routines.watch)
        for (let i = 0; i < this.config.routines.watch.length; i++) {

            const routine = this.config.routines.watch[i]
            const rate = routine.options && routine.options.rateLimiter ? routine.options.rateLimiter : 500
            const limiter = createRateLimiter(rate)

            fs.watch(routine.file, routine.options, (eventType, filename) => {
                limiter(async () => {
                    Terminal.ROUTINE(c.white(`Watch "${routine.file}"`))
                    const event = new WatchEvent(eventType, filename)
                    const handler = routine.handle
                    const error = await handler(event)
                    if (error) Terminal.ERROR('An error was encountered while performing operation:', error as Error)
                })
            })
            
        }

    }

    private async _runLaunchRoutines() {

        if (this.config.routines && this.config.routines.launch)
        for (let i = 0; i < this.config.routines.launch.length; i++) {

            Terminal.ROUTINE(c.white(`Launch #${i}`))

            const handler = this.config.routines.launch[i]
            const event = new LaunchEvent()
            const error = await handler(event)

            if (error) {
                Terminal.ERROR('An error was encountered while performing operation:', error)
                process.exit(-1)
            }
            
        }

    }

    private async _runIntervalRoutines() {

        if (this.config.routines && this.config.routines.interval) 
        for (let i = 0; i < this.config.routines.interval.length; i++) {

            const { time, handle } = this.config.routines.interval[i]
            let errorMessage: Error

            const trigger = createBreaker({
                cooldown: time,
                threshold: constants.BREAKER_INTERVAL_ERROR_MAX_COUNT,
                onTrigger: () => {
                    Terminal.ERROR(`An error was encountered while performing operation:`, errorMessage)
                },
                onBreak: () => {
                    clearInterval(interval)
                    Terminal.WARN(`Infinite error loop detected - Routine #${i} disabled.`)
                }
            })

            const interval = setInterval(async() => {

                const event = new SoybeanEvent()
                const error = await handle(event)
    
                if (error) {
                    errorMessage = error
                    trigger()
                }

            }, time)
            
        }
        
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

            // Child process lifecycle routines
            const cooldown = constants.BREAKER_PROCESS_RESTART_COOLDOWN
            const threshold = constants.BREAKER_PROCESS_RESTART_MAX_COUNT

            if (this.config.cp[name].onClose) {
                const trigger = createBreaker({
                    cooldown,
                    threshold,
                    onTrigger: () => {
                        this.config.cp![name].onClose!(new ChildProcessEvent(name, this.processManager.children.get(name)!.ref))
                    },
                    onBreak: () => {
                        Terminal.WARN(`The "onClose" event handler for process "${name}" has been blocked as it seems to be causing in an infinite loop.`)
                        process.removeListener('close', trigger)
                    }
                })
                process.on('close', trigger)
            }

            if (this.config.cp[name].onKill) {
                const trigger = createBreaker({
                    cooldown,
                    threshold,
                    onTrigger: () => {
                        this.config.cp![name].onKill!(new ChildProcessEvent(name, this.processManager.children.get(name)!.ref))
                    },
                    onBreak: () => {
                        Terminal.WARN(`The "onKill" event handler for process "${name}" has been blocked as it seems to be causing in an infinite loop.`)
                        process.removeListener('kill', trigger)
                    }
                })
                process.on('kill', trigger)
            }

            if (this.config.cp[name].onSpawn) {
                const trigger = createBreaker({
                    cooldown,
                    threshold,
                    onTrigger: () => {
                        this.config.cp![name].onSpawn!(new ChildProcessEvent(name, this.processManager.children.get(name)!.ref))
                    },
                    onBreak: () => {
                        Terminal.WARN(`The "onSpawn" event handler for process "${name}" has been blocked as it seems to be causing an infinite loop.`)
                        process.removeListener('spawn', trigger)
                    }
                })
                process.on('spawn', trigger)
            }

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

        // Save terminal history when quitting
        LiveTerminal.getLiveInstance().saveHistoryFile()

        Terminal.EXIT(`Stopped. (${Date.now() - start}ms)`)
        process.exit()

    }

}