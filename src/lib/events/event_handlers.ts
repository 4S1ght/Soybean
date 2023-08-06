
// This file contains miscellaneous event handlers.
// More specific handlers like exec, restart, kill and etc are/will be
// located in their separate files.

// Imports ==========================================================

import type * as E from './events.js'
import cp from 'child_process'

// Handlers =========================================================

/**
 * Creates a basic callback-based event handler
 */
export function handle <Event extends E.SoybeanEvent = E.SoybeanEvent, Meta = any>(callback: E.EventCallback<Event>, meta?: Meta): E.EventHandler<Event, Meta> {
    
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

/**
 * Creates an event handler group. This is useful when a single event, 
 * command or task should perform multiple actions in series.
 */
export function group(callbacks: E.EventHandler[]): E.EventHandler {
    return async function(e) {
        try {
            for (let i = 0; i < callbacks.length; i++) {
                const error = await callbacks[i](e)
                if (error) throw error
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
 * "wait" creates a handler that exists specifically to create 
 * time gaps in execution of handler groups.
 */
export function wait(time?: number): E.EventHandler {
    return () => new Promise<null | Error>(end => {
        setTimeout(() => end(null), time)
    })
}