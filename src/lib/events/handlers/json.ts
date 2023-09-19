
// Imports ===========================================================

import * as helpers from '../handler_helpers.js'
import type * as E from '../events.js'

// Types ============================================================

type Reviver = Parameters<typeof JSON.parse>["1"]
type Replacer = (this: any, key: string, value: any) => any

// Handlers =========================================================

/**
 * Reads out information saved on the event object under the name specified by the `key`
 * parameter and updates it with the parsed JSON object.
 *
 * Alias for `JSON.parse`
 */
export function parse<Event extends E.SoybeanEvent = E.SoybeanEvent>(key: string, reviver?: Reviver): E.EventHandler<Event>
export function parse<Event extends E.SoybeanEvent = E.SoybeanEvent>(key: string, saveTo?: string, reviver?: Reviver): E.EventHandler<Event>
export function parse<Event extends E.SoybeanEvent = E.SoybeanEvent>(key: string, saveOrReviver?: string | Reviver, reviver?: Reviver): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            
            helpers.getLoggerType(e.source)(`json.parse "${key}"`)

            let initialValue: string = e.get(key)
            let parsedValue: any
            
            if (typeof saveOrReviver === 'function') {
                parsedValue = JSON.parse(initialValue, saveOrReviver)
                e.set(key, parsedValue)
            }
            if (['undefined', 'string'].includes(typeof saveOrReviver)) {
                parsedValue = JSON.parse(initialValue, reviver)
                e.set((saveOrReviver || key) as string, parsedValue)
            }

            end(null)
            
        }
        catch (error) {
            end(error as Error)
        }
    })
}

/**
 * Reads out an object or an array saved on the event object under the name specified by the `key`
 * parameter and updates it with the stringified value.
 *
 * Alias for `JSON.stringify`
 */
export function stringify<Event extends E.SoybeanEvent = E.SoybeanEvent>(key: string, replacer?: Replacer): E.EventHandler<Event>
export function stringify<Event extends E.SoybeanEvent = E.SoybeanEvent>(key: string, saveTo?: string, replacer?: Replacer): E.EventHandler<Event>
export function stringify<Event extends E.SoybeanEvent = E.SoybeanEvent>(key: string, saveOrReplacer?: string | Replacer, replacer?: Replacer): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            
            helpers.getLoggerType(e.source)(`json.stringify "${key}"`)

            let initialValue: string = e.get(key)
            let parsedValue: any
            
            if (typeof saveOrReplacer === 'function') {
                parsedValue = JSON.stringify(initialValue, saveOrReplacer)
                e.set(key, parsedValue)
            }
            if (['undefined', 'string'].includes(typeof saveOrReplacer)) {
                parsedValue = JSON.stringify(initialValue, replacer)
                e.set((saveOrReplacer || key) as string, parsedValue)
            }

            end(null)
            
        }
        catch (error) {
            end(error as Error)
        }
    })
}