
// Imports ===========================================================

import Terminal from '../../terminal/terminal.js'
import * as helpers from '../handler_helpers.js'
import type * as E from '../events.js'

import path from 'path'
import fsp from 'fs/promises'

// Types ============================================================

type FSWriteFileData = Parameters<typeof fsp.writeFile>["1"]
type FSWriteFileOptions = Parameters<typeof fsp.writeFile>["2"]
type FSReadFileOptions = Parameters<typeof fsp.readFile>["1"]
type FSReadDirOptions = Parameters<typeof fsp.readdir>["1"]
type FSRmOptions = Parameters<typeof fsp.rm>["1"]
type FSMkdirOptions = Parameters<typeof fsp.mkdir>["1"]
type FSRmdirOptions = Parameters<typeof fsp.rmdir>["1"]

// Handlers =========================================================

/**
 * Creates a new directory recursively.
 *
 * Alias for `fs.mkdir`
 */
export function mkdir<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (directory: string | Symbol, options?: FSMkdirOptions): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const target = helpers.getStoredValue(e, directory)
            helpers.getLoggerType(e.source)(`mkdir "${target}"`)

            const $options = options !== null && typeof options === 'object' ? { recursive: true, ...options} : options
            const readyPath = helpers.toCWDRelative(target)
            await fsp.mkdir(readyPath, $options)
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}
/**
 * Asynchronously reads data from a file and saves it on the event object under the name specified by the `saveTo` parameter.
 * 
 * Alias for `fs.readFile`
 */
export function readdir<Event extends E.SoybeanEvent>
    (path: string | Symbol, saveTo: string, options?: FSReadDirOptions): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const target = helpers.getStoredValue(e, path)
            helpers.getLoggerType(e.source)(`readdir "${target}"`)

            const readyPath = helpers.toCWDRelative(target)
            const content = await fsp.readdir(readyPath, options!)
            e.set(saveTo, content)
            end(null)
        } 
        catch (error) {
            end(error as Error)    
        }
    })
}
/**
 * Removes a directory.
 *
 * Alias for `fs.rmdir`
 */
export function rmdir<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (directory: string | Symbol, options?: FSRmdirOptions): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const target = helpers.getStoredValue(e, directory)
            helpers.getLoggerType(e.source)(`rmdir "${target}"`)

            const readyPath = helpers.toCWDRelative(target)
            await fsp.rmdir(readyPath, options)
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}

/**
 * Asynchronously writes data to a file, replacing the file if it already exists.
 *
 * Alias for `fs.mkDir`
 */
export function rm<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (path: string | Symbol, options?: FSRmOptions): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const target = helpers.getStoredValue(e, path)
            helpers.getLoggerType(e.source)(`rm "${target}"`)

            const readyPath = helpers.toCWDRelative(target)
            await fsp.rm(readyPath, options)
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}

/**
 * Asynchronously reads data from a file and saves it on the event object under the name specified by the `saveTo` parameter.
 * 
 * Alias for `fs.readFile`
 */
export function readFile<Event extends E.SoybeanEvent>
    (file: string | Symbol, saveTo: string, options?: FSReadFileOptions): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const target = helpers.getStoredValue(e, file)
            helpers.getLoggerType(e.source)(`readfile "${target}"`)

            const readyPath = helpers.toCWDRelative(target)
            const content = await fsp.readFile(readyPath, options)
            e.set(saveTo, content)
            end(null)
        } 
        catch (error) {
            end(error as Error)    
        }
    })
}

/**
 * Asynchronously writes data to a file, replacing the file if it already exists.
 *
 * Alias for `fs.mkDir`
 */
export function writeFile<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (file: string | Symbol, content: FSWriteFileData | Symbol, options?: FSWriteFileOptions): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const fileTarget = helpers.getStoredValue(e, file)
            const contentTarget = helpers.getStoredValue(e, content)
            helpers.getLoggerType(e.source)(`writeFile "${fileTarget}"`)

            const readyPath = helpers.toCWDRelative(fileTarget)
            await fsp.writeFile(readyPath, contentTarget, options)
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}

/**
 *Asynchronously copies src to dest. By default, dest is overwritten if it already exists.
 *
 * Alias for `fs.mkDir`
 */
export function copyFile<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (src: string | Symbol, dest: string | Symbol, mode?: number): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const srcTarget = helpers.getStoredValue(e, src)
            const destTarget = helpers.getStoredValue(e, dest)
            helpers.getLoggerType(e.source)(`copyFile "${srcTarget}" -> ${destTarget}`)
            
            const srcPath = helpers.toCWDRelative(srcTarget)
            const destPath = helpers.toCWDRelative(destTarget)
            await fsp.copyFile(srcPath, destPath, mode)
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}

/**
 *Asynchronously changes the permissions of a file.
 *
 * Alias for `fs.chmod`
 */
export function chmod<Event extends E.SoybeanEvent = E.SoybeanEvent>
    (path: string | Symbol, mode: string|number): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const target = helpers.getStoredValue(e, path)
            helpers.getLoggerType(e.source)(`chmod "${target}"`)

            const readyPath = helpers.toCWDRelative(target)
            await fsp.chmod(readyPath, mode)
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}
