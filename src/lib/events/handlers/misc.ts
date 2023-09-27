
// This file contains miscellaneous event handlers.
// More specific handlers like exec, restart, kill and etc are/will be
// located in their separate files.

// Imports ==========================================================

import type * as E from '../events.js'
import * as helpers from '../handler_helpers.js'

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

// ==================================================================

export interface GroupEvent {
    /** 
     * Stops event propagation inside the event group.  
     * No further event handlers in the event group will be called.
    */
    stopPropagation(): void
}
/**
 * Creates an event handler group. This is useful when a single event,
 * command or task should perform multiple actions in series.
 */
export function group<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (callbacks: E.EventHandler<Event & GroupEvent>[]): E.EventHandler<Event & GroupEvent> {

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

// ==================================================================

/**
 * Creates a handler that exists specifically to create
 * time gaps in execution of grouped handlers.
 */
export function wait<Event extends E.SoybeanEvent = E.SoybeanEvent>(time?: number): E.EventHandler<Event> {
    return () => new Promise<null | Error>(end => {
        setTimeout(() => end(null), time)
    })
}

// ==================================================================

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

// ==================================================================

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

// ==================================================================

export interface ForLoopEvent {
    loopLabelStack: string[]
    break(loop?: string): void

    broken: string | boolean | undefined
}

function prepareLoopEvent(e: ForLoopEvent, loopID?: string): [string, boolean] {

    if (!e.loopLabelStack) e.loopLabelStack = []
    if (!e.break) e.break = (loop?: string) => { e.broken = loop || true }
    
    function generateUniqueID(): string {
        const id = String(Math.random() * 1000000).substring(0, 3)
        return e.loopLabelStack.includes(id) ? generateUniqueID() : id
    }

    const id = loopID || generateUniqueID()
    e.loopLabelStack.push(id)
    return [id, !!loopID]
}

/**
 * Executes an event handler inside a `for` loop and automatically sets `array`, `value` and `index` 
 * event variables.
 * ```js
 * // Example
 * handlers.forEach(['hello', 'world', '!'], handlers.handle(e => {
 *    console.log(`Item "${e.get('value')}" at index "${e.get('index')}"`)
 * }))
 * // Output:
 * // 0: "hello"
 * // 1: "world"
 * // 2: "!"
 * ```
 */

export function forEach<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (iterable: Array<any>|Symbol, handler: E.EventHandler<Event & ForLoopEvent>): E.EventHandler<Event & ForLoopEvent>

export function forEach<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (iterable: Array<any>|Symbol, id: string, handler: E.EventHandler<Event & ForLoopEvent>): E.EventHandler<Event & ForLoopEvent>

export function forEach<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (iterable: Array<any>|Symbol, idOrHandler: string|E.EventHandler<Event & ForLoopEvent>, handler?: E.EventHandler<Event & ForLoopEvent>): E.EventHandler<Event & ForLoopEvent> {

    return async (event) => {
        try {

            const [$id, $customID] = prepareLoopEvent(event, typeof idOrHandler === 'string' ? idOrHandler : undefined)
            const $handler = typeof idOrHandler === 'string' ? handler! : idOrHandler
            const $iterable = helpers.getStoredValue(event, iterable)
            const $getFieldName = (field: string) => $customID ? `${$id}-${field}` : field

            function del() {
                event.del($getFieldName('array'))
                event.del($getFieldName('index'))
                event.del($getFieldName('value'))
            }

            for (let i = 0; i < $iterable.length; i++) {

                event.set($getFieldName('array'), iterable)
                event.set($getFieldName('index'), i)
                event.set($getFieldName('value'), $iterable[i])

                const error = await $handler(event)
                if (error) { del(); return error as Error }

                if (event.broken === true) {
                    event.broken = undefined
                    break
                }
                if (typeof event.broken === 'string') {
                    const brokenIndex = event.loopLabelStack.indexOf(event.broken)
                    const thisIndex = event.loopLabelStack.indexOf($id)
                    if (thisIndex === brokenIndex) event.broken = undefined
                    if (thisIndex >= brokenIndex) break
                }

            }

            event.loopLabelStack.pop()
            del()
            return null

        } 
        catch (error) {
            return error as Error
        }
    }

}

// ==================================================================

export interface ForOfIterable {
    [Symbol.iterator](): IterableIterator<any>
}

/**
 * Executes an event handler inside a `for of` loop and automatically sets `object` and `value`` 
 * event variables.
 * ```js
 * // Example
 * handlers.forOf(someMap, handlers.handle(e => {
 *    console.log(`A map's item is: "${e.get('value')}"`)
 * }))
 * ```
 */

export function forOf<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (iterable: ForOfIterable|Symbol, handler: E.EventHandler<Event & ForLoopEvent>): E.EventHandler<Event & ForLoopEvent>
    
export function forOf<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (iterable: ForOfIterable|Symbol, id: string, handler: E.EventHandler<Event & ForLoopEvent>): E.EventHandler<Event & ForLoopEvent>
    
export function forOf<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (iterable: ForOfIterable|Symbol, idOrHandler: string|E.EventHandler<Event & ForLoopEvent>, handler?: E.EventHandler<Event & ForLoopEvent>): E.EventHandler<Event & ForLoopEvent> {

    return async (event) => {
        try {

            const [$id, $customID] = prepareLoopEvent(event, typeof idOrHandler === 'string' ? idOrHandler : undefined)
            const $handler = typeof idOrHandler === 'string' ? handler! : idOrHandler
            const $iterable = helpers.getStoredValue(event, iterable)
            const $getFieldName = (field: string) => $customID ? `${$id}-${field}` : field

            function del() {
                event.del($getFieldName('object'))
                event.del($getFieldName('value'))
            }

            for (const iterator of $iterable) {

                event.set($getFieldName('object'), $iterable)
                event.set($getFieldName('value'), iterator)

                const error = await $handler(event)
                if (error) { del(); return error as Error }

                if (event.broken === true) {
                    event.broken = undefined
                    break
                }
                if (typeof event.broken === 'string') {
                    const brokenIndex = event.loopLabelStack.indexOf(event.broken)
                    const thisIndex = event.loopLabelStack.indexOf($id)
                    if (thisIndex === brokenIndex) event.broken = undefined
                    if (thisIndex >= brokenIndex) break
                }

            }

            event.loopLabelStack.pop()
            del()
            return null

        } 
        catch (error) {
            return error as Error    
        }
    }

}

// ==================================================================

export function forIn<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (iterable: Record<any, any>|Symbol, handler: E.EventHandler<Event & ForLoopEvent>): E.EventHandler<Event & ForLoopEvent>

export function forIn<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (iterable: Record<any, any>|Symbol, id: string, handler: E.EventHandler<Event & ForLoopEvent>): E.EventHandler<Event & ForLoopEvent>

export function forIn<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (iterable: Record<any, any>|Symbol, idOrHandler: string|E.EventHandler<Event & ForLoopEvent>, handler?: E.EventHandler<Event & ForLoopEvent>): E.EventHandler<Event & ForLoopEvent> {

    return async (event) => {
        try {

            const [$id, $customID] = prepareLoopEvent(event, typeof idOrHandler === 'string' ? idOrHandler : undefined)
            const $handler = typeof idOrHandler === 'string' ? handler! : idOrHandler
            const $iterable = helpers.getStoredValue(event, iterable)
            const $getFieldName = (field: string) => $customID ? `${$id}-${field}` : field

            function del() {
                event.del($getFieldName('object'))
                event.del($getFieldName('key'))
                event.del($getFieldName('value'))
            }

            for (const key in $iterable) {
                if (Object.prototype.hasOwnProperty.call(iterable, key)) {

                    event.set($getFieldName('object'), iterable)
                    event.set($getFieldName('key'), key)
                    event.set($getFieldName('value'), $iterable[key])

                    const error = await $handler(event)
                    if (error) { del(); return error as Error }

                    if (event.broken === true) {
                        event.broken = undefined
                        break
                    }
                    if (typeof event.broken === 'string') {
                        const brokenIndex = event.loopLabelStack.indexOf(event.broken)
                        const thisIndex = event.loopLabelStack.indexOf($id)
                        if (thisIndex === brokenIndex) event.broken = undefined
                        if (thisIndex >= brokenIndex) break
                    }

                }
            }

            event.loopLabelStack.pop()
            del()
            return null
            
        } 
        catch (error) {
            return error as Error    
        }
    }

}
