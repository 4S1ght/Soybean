
// This file contains miscellaneous event handlers.
// More specific handlers like exec, restart, kill and etc are/will be
// located in their separate files.

// Imports ==========================================================

import type * as E from '../events.js'
import * as helpers from '../handler_helpers.js'

// Types ============================================================

export interface GroupEvent extends E.SoybeanEvent {
    /** 
     * Stops event propagation inside the event group.  
     * No further event handlers in the event group will be called.
    */
    stopPropagation(): void
}

// Handlers =========================================================

/**
 * Creates a basic callback-based event handler
 */
export function handle<Event extends E.SoybeanEvent = E.SoybeanEvent, Meta = any>
    (callback: E.EventCallback<Event>, meta?: Meta): E.EventHandler<Event, Meta> {

    const handler: E.EventHandler<Event, Meta> = async function(e) {
        try {
            await callback(e)
            return null
        }
        catch (error) {
            return error as Error
        }
    }

    handler.meta = meta
    return handler

}

/**
 * Creates an event handler group. This is useful when a single event,
 * command or task should perform multiple actions in series.
 */
export function group<Event extends GroupEvent = GroupEvent>
    (callbacks: E.EventHandler<GroupEvent>[]): E.EventHandler<Event> {

    return async function(e) {

        let eventStopped = false
        e.stopPropagation = () => eventStopped = true

        try {
            for (let i = 0; i < callbacks.length; i++) {
                const error = await callbacks[i](e)
                if (error) throw error
                if (eventStopped) break
            }
            return null
        }
        catch (error) {
            return error as Error
        }

    }

}

/**
 * Creates a handler that exists specifically to create
 * time gaps in execution of grouped handlers.
 */
export function wait<Event extends E.SoybeanEvent = E.SoybeanEvent>(time?: number): E.EventHandler<Event> {
    return () => new Promise<null | Error>(end => {
        setTimeout(() => end(null), time)
    })
}

/**
 * Sets a variable on the event object inside a grouped handler.
 * ```javascript
 * // Example
 * handlers.group([
 *     handlers.set('start', Date.now()),
 *     handlers.wait(1000),
 *     handlers.handle(e => console.log(`Done in ${Date.now() - e.get('start')}ms`))
 * ])
 * ```
 */
export function set<Event extends E.SoybeanEvent = E.SoybeanEvent>(itemName: string, data: any): E.EventHandler<Event> {
    return async function(e) {
        e.set(itemName, data)
        return null
    }
}

/**
 * Updates a variable on the event object inside a grouped handler.  
 * **Note:** The variable must be set before updating, otherwise the value passed to the 
 * callback will be `undefined`. This can be done with many event handlers, such as the `set` handler.
 * ```javascript
 * // Example
 * handlers.group([
 *     handlers.set('time', Date.now()),
 *     handlers.wait(1000),
 *     handlers.update('time', time => Date.now() - time)
 *     handlers.handle(e => console.log(`Done in ${e.get('time')}ms`))
 * ])
 * ```
 */
export function update<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (itemName: string, callback: <Data = any>(data: Data) => Promise<any> | any): E.EventHandler<Event> {

    return async function(e) {
        await e.updateAsync(itemName, callback)
        return null
    }

}

