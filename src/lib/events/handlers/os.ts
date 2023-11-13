
// Imports ==========================================================

import type * as E from '../events.js'

// Handlers =========================================================

/**
 * Runs the callback event handler only if Node's native `process.platform` 
 * matches at least one name in the `platform` parameter.
 * ```js
 * // Example
 * handlers.os.platform('darwin|linux', handlers.handle(event => {
 *     console.log("We're running on MacOS or Linux!")
 * }))
 * ```
 */
export function platform<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (platform: typeof process.platform, handler: E.EventHandler<Event>): E.EventHandler<Event> {

    return async function(e) {
        const error = platform.split('|').includes(process.platform) ? await handler(e) : null
        if (error) return error as Error
        return null
    }

}
