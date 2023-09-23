
import path from 'path'
import Terminal from '../terminal/terminal.js'
import type * as E from "./events.js"

/**
 * Event handlers can pass information between them via the event object.
 * This method helps them easily extract information without any complicated logic and custom handlers
 */
export function getStoredValue<ValueType>(event: E.SoybeanEvent, value: ValueType): Exclude<ValueType, Symbol> {
    return typeof value === 'symbol'
        ? event.get(value.description!) 
        : value
}

/**
 * If the path is relative it will be turned into an absolute one relative to the current working directory.
 * The same string is returned when the path is absolute.
 */
export function toCWDRelative(p: string) {
    return path.isAbsolute(p) 
        ? p 
        : path.join(process.cwd(), p)
}

/**
 * Returns the appropriate logging function for the event type.
 */
export function getLoggerType(eventSource: E.SoybeanEvent['source']) {
    switch (eventSource) {
        case 'launch':      return Terminal.ROUTINE
        case 'watcher':     return Terminal.ROUTINE
        case 'terminal':    return Terminal.CMD
        default:            return Terminal.INFO
    }
}