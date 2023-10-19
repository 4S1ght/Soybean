
import path from 'path'
import Terminal from '../terminal/terminal.js'
import * as E from "./events.js"


/**
 * Finds all the string template occurrences such as `{{ my-variable }}`
 * and replaces them with data from the event object living under the key matching the text inside the brackets, excluding the whitespace around the curly brackets.
 */
function replaceStringTemplateOccurrences(e: E.SoybeanEvent, string: string) {
    return string.replace(/\{\{\s*([^}]+)\s*\}\}/g, (sub, match, ...args) => {
        return e.get(match.trim())
    })
}

/**
 * Event handlers can pass information between them via the event object.
 * This method helps them easily extract information without any complicated logic and custom handlers
 */
export function getStoredValue<ValueType>(event: E.SoybeanEvent, value: ValueType): Exclude<ValueType, Symbol> {
    return typeof value === 'symbol'
        ? event.get(value.description!) 
        : typeof value === 'string'
            ? replaceStringTemplateOccurrences(event, value)
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