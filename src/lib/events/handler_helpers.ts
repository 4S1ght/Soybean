
import path from 'path'
import type { SoybeanEvent } from "./events.js"

/**
 * Event handlers can pass information between them via the event object.
 * This method helps them easily extract information without any complicated logic and custom handlers
 */
export function getStoredValue(event: SoybeanEvent, value: any) {
    return typeof value === 'symbol'
        ? event.get(value.description!)
        : value
}

export function toCWDRelative(p: string) {
    return path.isAbsolute(p) 
        ? p 
        : path.join(process.cwd(), p)
}