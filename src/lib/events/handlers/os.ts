
// Imports ==========================================================

import type * as E from '../events.js'
import * as helpers from '../handler_helpers.js'

// Handlers =========================================================

/**
 * Runs the callback event handler only if the `platform` parameter matches the current value of `process.platform`.
 * ```js
 * // Example
 * handlers.os.platform('darwin', handlers.handle(event => {
 *     console.log('We're running on MacOS!')
 * }))
 * ```
 */
export function platform<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (platform: typeof process.platform, handler: E.EventHandler<Event>): E.EventHandler<Event> {

    return async function(e) {
        const error = process.platform === platform ? await handler(e) : null
        if (error) return error as Error
        return null
    }

}
