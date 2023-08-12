
import readline from "readline"
import cp from 'child_process'
import path from "path"
import fs from 'fs'
import c from 'chalk'
import EventEmitter from "events"

import Terminal from "./terminal.js"
import type { LiveTerminalSettings } from '../types.js'

// =========================================

import * as url from 'url'
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

// =========================================

interface KeyInput {
    sequence: string
    name:     string
    ctrl:     boolean
    meta:     boolean
    shift:    boolean
}

const getStdColumns = () => process.stdout.columns - 1
const desync = (x: Function) => setTimeout(x, 0)

/** Delay between CTRL+C to quit the application. */
const CTRL_C_ACCEPT_DELAY = 300
/** Keys/sequences not accepted by KEY_DEFAULT handler */
const DISABLED_SEQ = ['\r', '\x03', '\x1B']


export interface LiveTerminal {
    on(eventName: string,             listener: (...args: string[]) => void         ): this
    on(eventName: 'exit',             listener: () => any                           ): this
    on(eventName: 'history-emit',     listener: (file: string) => any               ): this
    on(eventName: 'history-emit-err', listener: (file: string, error: Error) => any ): this
    on(eventName: 'history-load-err', listener: (file: string, error: Error) => any ): this
}
export class LiveTerminal extends EventEmitter {

    // Stores live instance reference to the terminal class
    private static instance: LiveTerminal
    public static getLiveInstance = () => this.instance

    public captures: boolean = false

    constructor(public p?: LiveTerminalSettings) {
        super()
        LiveTerminal.instance = this
    }

    public async start(): Promise<void> {
        readline.emitKeypressEvents(process.stdin)
        this._loadHistoryFile()
        this.startInputCapture()
        await this._attachPassthroughShell()
    }

    public startInputCapture(): void {
        if (!this.captures) {
            this.captures = true
            process.stdin.setRawMode(true)
            process.stdin.on('keypress', (string, key: KeyInput) => {

                if      (key.sequence === '\r')                                 this.KEY_ENTER()
                else if (key.name === 'backspace')                              this.KEY_BACKSPACE()
                else if (key.name === 'delete')                                 this.KEY_DELETE()
                else if (key.name === 'c' && key.ctrl)                          this.SEQUENCE_EXIT()
                else if (key.name === 'escape' && key.sequence === '\x1B\x1B')  this.SEQUENCE_ESCAPE()

                else if (key.name === 'up')                                     this.KEY_UP()
                else if (key.name === 'down')                                   this.KEY_DOWN()
                else if (key.name === 'left')                                   this.KEY_LEFT()
                else if (key.name === 'right')                                  this.KEY_RIGHT()

                else                                                            this.KEY_DEFAULT(key)

                this._displayCommandString()

            })
        }
    }

    public stopInputCapture(): void {
        if (this.captures) {
            this.captures = false
            process.stdin.setRawMode(false)
            process.stdin.removeAllListeners('keypress')
        }
    }

    /**
     * Displays the currently edited command in the bottom-most line of the terminal.
     *
     * Due to random IO from child processes the string might be duplicated across multiple
     * lines if it's being edited while something is being printed out to the console.
     */
    private _displayCommandString() {
        return new Promise<void>(resolve => {

            const text = this._getCurrentCommand()
                .slice(this._xOffset, this._xOffset + getStdColumns())
                .join('')

            const finish = () => readline.cursorTo(process.stdout, this._cursorIndex - this._xOffset, process.stdout.rows)

            readline.cursorTo(process.stdout, 0, process.stdout.rows, () => {
                readline.clearLine(process.stdout, 0, () => {
                    // Display the command string
                    if (this._finishedCommand) {
                        console.log(this._finishedCommand)
                        this._finishedCommand = ''
                        resolve()
                    }
                    else {
                        process.stdout.write(text, finish)
                        resolve()
                    }
                })
            })

        })
    }

    /**
     * Creates and attaches a hidden shell for command passthrough.
     * If attached, any unrecognized commands will be passed to the background shell instead of throwing an error
     */
    private _attachPassthroughShell(hideWarning?: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.p && this.p!.passthroughShell) {
                if (!hideWarning) Terminal.WARN(`Shell passthrough has been enabled (${this.p!.passthroughShell})`)
                if (typeof this.p!.passthroughShell === 'boolean') {
                    if      (process.platform === 'win32')  this.p!.passthroughShell = process.env.COMSPEC || 'cmd.exe'
                    else if (process.platform === 'darwin') this.p!.passthroughShell = process.env.SHELL || '/bin/zsh'
                    else                                    this.p!.passthroughShell = process.env.SHELL || '/bin/sh'
                }
                try {
                    this._shell = cp.spawn(this.p!.passthroughShell, {
                        stdio: ['pipe', 'inherit', 'inherit'],
                        cwd: process.cwd()
                    })
                    this._shell.on('spawn', resolve)
                }
                catch (error) {
                    reject(error)
                }
            }
            else resolve()
        })
    }

    private _resetCursorPosition = () => new Promise<void>(resolve => {
        readline.cursorTo(process.stdout, 0, process.stdout.rows, () => resolve())
    })

    /* Get the currently edited command. */
    private _getCurrentCommand = () => this._history[this._historyIndex]
    /** Get the last command that was used. */
    private _getLastCommand = () => this._history[this._history.length - 1]
    /** Clears the currently edited command. */
    private _clearCurrentCommand = () => this._history[this._historyIndex] = []
    /** Check whether editing a command from history to copy it to the current working array. */
    private _isEditingOldCommand = () => this._historyIndex < this._history.length - 1

    /** Command history */
    private _history: string[][] = [[]]
    /** Current position in the history */
    private _historyIndex: number = 0
    /** Current X position of the cursor while editing a command. */
    private _cursorIndex: number = 0
    /** Determines x-axis scrolling offset if a command is longer than total amount of columns. */
    private _xOffset: number = 0
    /** Stores the time of the last exit call to detect double CTRL+C for exiting the app. */
    private _lastExitCall: number = 0
    /** Caches cursor index and offset when navigating between commands in case the user wants to go back to the current one. */
    private _indexAndOffsetCache: [number, number] = [0, 0]
    /** Stores a the finished command to be displayed when the user presses ENTER. */
    private _finishedCommand: string = ''

    /** Reference to the live background shell configured by the user. */
    private declare _shell: cp.ChildProcess

    /** Loads a history file back to memory. */
    private _loadHistoryFile(): void {
        if (this.p && this.p!.keepHistory) {
            try {
                const file = path.join(__dirname, "../../../.cmdhistory")
                if (fs.existsSync(file)) {
                    this._history = [
                        ...fs.readFileSync(file, { encoding: 'utf-8'}).split('\n').map(x => x.split('')),
                        []
                    ]
                    this._historyIndex = this._history.length -1
                }
            }
            catch (error) {
                console.log(error)
                this.emit('history-load-err', error as Error)
            }
        }
    }

    /** Writes the history to a file to keep it across multiple sessions. */
    private _saveHistoryFile(): void {
        if (this.p && this.p!.keepHistory) {
            try {
                const file = path.join(__dirname, "../../../.cmdhistory")
                const slice = this._history.slice(-this.p!.keepHistory)
                slice.pop() // Remove working char array (the one that can be edited by the user)
                const history = slice.map(x => x.join('')).join('\n')
                fs.writeFileSync(file, history, 'utf-8')
                this.emit('history-emit')
            }
            catch (error) {
                this.emit('history-emit-err', error as Error)
            }
        }
    }

    /**
     * loads a command from history to the latest spot in history
     * where it can be edited as if it was typed manually.
     */
    private _loadCommandFromHistory(): void {
        const toIndex = this._history.length - 1
        const fromIndex = this._historyIndex
        this._history[toIndex] = [...this._history[fromIndex]]
        this._historyIndex = toIndex
    }

    /**
     * Removes last command from history if it's the exact same as the previous one.
     * Useful when pressing the UP key to reuse the same command.
     * This is so repeating the same command doesn't flood the history.
     * (I'm looking at you ZSH...)
     */
    private _removeDuplicateCommandString(): void {
        try {
            const iLast = this._history.length - 1, iPrev = this._history.length - 2
            if (this._history[iLast].join('') === this._history[iPrev].join(''))
                this._history.pop()
        }
        catch {}
    }

    /**
     * Sets the proper cursor position and x offset for navigating up/down in history
     */
    private _setIndexAndOffset(): void {
        if (this._isEditingOldCommand()) {
            const command = this._getCurrentCommand()
            this._cursorIndex = command.length
            const offset = command.length - getStdColumns()
            this._xOffset = Math.max(0, offset)
        }
        else {
            this._cursorIndex = this._indexAndOffsetCache[0]
            this._xOffset     = this._indexAndOffsetCache[1]
        }
    }

    private _showCommandError(command: string, args: string[], error: Error): void {
        const _args = args.join(' ')
        Terminal.ERROR(`An error had occurred after calling the command handler for "${command}${_args ? ' '+_args : ''}":`)
        console.log(error)
    }
    private _showUnknownCommandError(command: string): void {
        Terminal.ERROR(`"${command}" is recognized as neither internal or user-configured command.`)
    }
    private _showPassthroughDisabledError(command: string): void {
        Terminal.ERROR(`"${command}" was used with a force character "/" but shell passthrough is disabled.`)
    }

    // KEYS
    // =========================================

    /** Handle any non-special keys */
    private KEY_DEFAULT(key: KeyInput): void {
        if (this._isEditingOldCommand()) this._loadCommandFromHistory()
        const chars = this._getLastCommand()
        if (!DISABLED_SEQ.includes(key.sequence)) {
            chars.splice(this._cursorIndex, 0, key.sequence)
            this._cursorIndex++
            if (chars.length > getStdColumns()) this._xOffset++
        }
    }

    /** Submits a command. */
    private KEY_ENTER(): void {
        if (this._isEditingOldCommand()) this._loadCommandFromHistory()

        let string = this._getLastCommand().join('')
        if (string.replace(/ |\t/g, '').length === 0) return

        let args = string.split(' ')
        let command = args.shift()

        const forcePassthrough = string[0] === '/'

        if (forcePassthrough) {
            command = command?.replace('/', '')
        }

        if (this._getLastCommand().length > 0) {
            this._removeDuplicateCommandString()
            this._history.push([])
            this._historyIndex = this._history.length - 1
        }

        // Reset cursor index and offset
        this._cursorIndex = 0
        this._xOffset = 0

        // ============================================================

        // Execute the given command
        const commandExecStatus = (() => {
            const isKnownCommand = this.eventNames().includes(command!)
            const passthrough = this._shell

            if (forcePassthrough) {
                if (this.p && this.p!.passthroughShell) {
                    desync(() => this._shell.stdin?.write(`${command}` + (args.length ? ` ${args.join(' ')}` : '') + '\n'))
                    return "cPASS"
                }
                else {
                    desync(() => this._showPassthroughDisabledError(command!))
                    return "cERR"
                }
            }

            if (isKnownCommand) {
                desync(async () => {
                    try           { await this.emit(command!, ...args) }
                    catch (error) { this._showCommandError(command!, args, error as Error) }
                })
                return "cOK"
            }

            if (!isKnownCommand) {
                if (passthrough) {
                    desync(() => this._shell.stdin?.write(`${command}` + (args.length ? ` ${args.join(' ')}` : '') + '\n'))
                    return "cPASS"
                }
                if (!passthrough) {
                    desync(async () => this._showUnknownCommandError(command!))
                    return "cERR"
                }
            }

            return "cOK"

        })()


        // Choose command display color
        const cp = ({
            cOK: c.grey,
            cERR: c.red,
            cPASS: c.blue
        })[commandExecStatus];

        if (string.length + 6 > getStdColumns()) {
            string = string.slice(0, getStdColumns() - 7) + '...'
        }

        // Requires 3rd party fonts to render the message
        // this._finishedCommand =
        //     cp.statBG('  ') + cp.stat(cp.contentBG('\uE0B0')) +
        //     cp.text(cp.contentBG(` ${string}`)) + cp.content('\uE0B0') + "\x1b[0m"

        // Use a general message that all terminals should be able to render correctly.
        this._finishedCommand =
            cp(`> ${string}`)

    }

    /** Removes a character behind the cursor. */
    private KEY_BACKSPACE(): void {
        if (this._isEditingOldCommand()) this._loadCommandFromHistory()
        const chars = this._getLastCommand()
        if (chars.length > 0 && this._cursorIndex > 0) {
            chars.splice(this._cursorIndex-1, 1)
            this._cursorIndex--
        }
        if (chars.length > 0 && this._xOffset > 0) this._xOffset--
    }

    /** Removes a character in front of the cursor */
    private KEY_DELETE(): void {
        if (this._isEditingOldCommand()) this._loadCommandFromHistory()
        const chars = this._getLastCommand()
        if (this._cursorIndex < chars.length) {
            chars.splice(this._cursorIndex, 1)
        }
        if (chars.length > 0 && this._xOffset > 0) this._xOffset--
    }

    // CURSOR KEYS
    // =========================================

    /** Goes UP, or "back" in history. */
    private KEY_UP(): void {
        // Save current commands cursor and offset position before navigating
        if (!this._isEditingOldCommand()) this._indexAndOffsetCache = [ this._cursorIndex, this._xOffset ]
        if (this._historyIndex > 0) this._historyIndex--
        this._setIndexAndOffset()
    }

    /** Goes DOWN, or "forward" in history. */
    private KEY_DOWN(): void {
        if (this._historyIndex < this._history.length - 1) this._historyIndex++
        this._setIndexAndOffset()
    }

    /** Changes the X position of the cursor while typing in the command. */
    private KEY_LEFT(): void {
        const currentX = this._cursorIndex
        if (currentX > 0) this._cursorIndex--
        else if (this._xOffset > 0) this._xOffset--
    }

    /** Changes the X position of the cursor while typing in the command. */
    private KEY_RIGHT(): void {
        const currentX = this._cursorIndex
        const command = this._getCurrentCommand()
        if (currentX < command.length) this._cursorIndex++
        if (currentX === getStdColumns() && command.length > currentX + this._xOffset) this._xOffset--
    }

    // KEY SEQUENCES
    // =========================================

    /** Handles the exit sequence */
    private async SEQUENCE_EXIT(): Promise<void> {
        const now = Date.now()
        if (now - CTRL_C_ACCEPT_DELAY < this._lastExitCall) {
            this._saveHistoryFile()

            // Clear stdio line in case it had content and there are exit logs made externally
            /**/ this._clearCurrentCommand()        // Clear history
            /**/ await this._displayCommandString() // Reflect it in the terminal
            /**/ await this._resetCursorPosition()  // Reset cursor position before potential logs

            this.emit('exit')
        }
        this._lastExitCall = now
    }

    private async SEQUENCE_ESCAPE(): Promise<void> {
        if (this._shell) {
            this._shell.kill("SIGTERM")
            await this._attachPassthroughShell(true)
            Terminal.INFO(`Restarted ${this.p!.passthroughShell}`)
        }
    }

}

export default LiveTerminal