
// Imports ===========================================================

import Terminal from '../../terminal/terminal.js'
import ProcessManager from '../../process/process_mgr.js'

import type * as E from '../events.js'

// Types ============================================================

// Helpers ==========================================================

const pmi = () => ProcessManager.getLiveInstance()

// Handlers =========================================================

export function kill<Event extends E.SoybeanEvent = E.SoybeanEvent>(process: string): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            if (e.source === 'task') Terminal.TASK(`kill "${process}"`)
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

export function restart<Event extends E.SoybeanEvent = E.SoybeanEvent>(process: string): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            if (e.source === 'task') Terminal.TASK(`restart "${process}"`)
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

export function revive<Event extends E.SoybeanEvent = E.SoybeanEvent>(process: string): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            if (e.source === 'task') Terminal.TASK(`revive "${process}"`)
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