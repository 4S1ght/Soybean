
// Imports ===========================================================

import Terminal from '../../terminal/terminal.js'
import LiveTerminal from '../../terminal/liveterminal.js'
import type * as E from '../events.js'

import cp, { StdioOptions } from 'child_process'

// Handlers =========================================================

interface ExecOptions extends Omit<cp.SpawnOptions, "stdio"> {
    stdio?: 'all' | 'none' | 'takeover'
}

function extractArgv(argv: string | string[]): [string, string[]] {
    const $argv = [...argv]
    return Array.isArray(argv) ? [$argv.shift()!, $argv] : [argv, []]
}

/**
 * Creates a child process when called.
 * This does NOT create a new child process that is manageable the same way the `cp` object allows to configure.
 */
export function spawn(command: string | string[], settings: ExecOptions = {}): E.EventHandler {
    return (e) => new Promise<null | Error>(end => {

        const [cmd, spawnargs] = extractArgv(command)
        const log = e.source === 'task' ? Terminal.TASK : Terminal.INFO
        const lt = LiveTerminal.getLiveInstance()

        const stdio = ({
            all: ['ignore', 'inherit', 'inherit'],
            none: ['ignore', 'ignore', 'ignore'],
            takeover: ['inherit', 'inherit', 'inherit']
        })[settings.stdio || 'all'] as StdioOptions

        try {
            settings.stdio === 'takeover' && lt && lt.stopInputCapture()
            const process = cp.spawn(cmd, spawnargs, {
                ...settings,
                shell: settings.shell,
                stdio: stdio,
            })
            process.on('error', (error) => {
                log(`spawn error ("${[cmd, ...spawnargs].join(' ')}"), code: ${process.exitCode}`, error as any as string)
                lt.startInputCapture()
                process.kill()
                end(error as Error)
            })
            process.on('exit', () => {
                log(`spawn finished ("${[cmd, ...spawnargs].join(' ')}"), code: ${process.exitCode}`)
                lt.startInputCapture()
                end(null)
            })
        }
        catch (error) {
            settings.stdio === 'takeover' && lt && lt.startInputCapture()
            end(error as Error)
        }

    })
}