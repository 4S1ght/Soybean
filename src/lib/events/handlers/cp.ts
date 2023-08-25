
// Imports ===========================================================

import Terminal from '../../terminal/terminal.js'
import ProcessManager from '../../process/process_mgr.js'
import * as helpers from '../handler_helpers.js'

import type * as E from '../events.js'

// Types ============================================================

// Helpers ==========================================================

const pmi = () => ProcessManager.getLiveInstance()

// Handlers =========================================================

/**
 * Kills the child process of a given name.  
 * Acts similar to the `kl` command.
 */
export function kill<Event extends E.SoybeanEvent = E.SoybeanEvent>(process: string): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            helpers.getLoggerType(e.source)(`kill "${process}"`)
            const cp = pmi().children.get(process)

            if (!cp) throw new Error(`Could not find process "${process}"`)
            await cp.kill()
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}

/**
 * Restarts the child process of a given name.  
 * Acts similar to the `kl` command.
 */
export function restart<Event extends E.SoybeanEvent = E.SoybeanEvent>(process: string): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            helpers.getLoggerType(e.source)(`restart "${process}"`)
            const cp = pmi().children.get(process)

            if (!cp) throw new Error(`Could not find process "${process}"`)
            await cp.restart()
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}

/**
 * Revives the child process of a given name.  
 * Acts similar to the `kl` command.
 */
export function revive<Event extends E.SoybeanEvent = E.SoybeanEvent>(process: string): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            helpers.getLoggerType(e.source)(`revive "${process}"`)
            const cp = pmi().children.get(process)

            if (!cp) throw new Error(`Could not find process "${process}"`)
            await cp.revive()
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}