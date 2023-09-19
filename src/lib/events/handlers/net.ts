
// Imports ===========================================================

import * as helpers from '../handler_helpers.js'
import type * as E from '../events.js'

// Types ============================================================

type FetchInput = Parameters<typeof fetch>["0"]

type FetchResponse<Event> = Awaited<ReturnType<typeof fetch>> & {
    /** Reference to the event object. */
    event: Event
}
type FetchInit<Event extends E.SoybeanEvent> = Parameters<typeof fetch>["1"] & { 
    /** Fetch event handler callback, responsible for processing the response object. */
    cb?: (response: FetchResponse<Event>) => any | Promise<any> 
}

// Handlers =========================================================

/**
 * Makes a network request.
 * The handler's structure is very similar to the native fetch method, with the difference that
 * the callback function is specified inside the request configuration object (the `init` parameter).
 * This callback has access to the usual response object, with an added `event` property, allowing you
 * to access the event object and save the response body for further processing. 
 * 
 * ```typescript
 * handlers.net.fetch("https://google.com", {
 *     // Usual request settings
 *     method: "GET",
 *     headers: { "Content-Type": "application/json" },
 *     // Custom callback function
 *     cb: async (e) => {
 *         // Parse the body
 *         const body = await e.json()
 *         // Save the body on the event object
 *         // to further process it in the next event handler.
 *         e.set('response', body)
 *     }
 * })
 * ```
 */
const $fetch = function<Event extends E.SoybeanEvent = E.SoybeanEvent>(input: FetchInput, init?: FetchInit<Event>): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const res = await fetch(input, init)
            if (init && init.cb) await init.cb({ ...res, event: e })
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}

export { $fetch as fetch }