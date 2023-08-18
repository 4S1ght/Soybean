
// Imports ===========================================================

import Terminal from '../../terminal/terminal.js'
import * as helpers from '../handler_helpers.js'
import type * as E from '../events.js'

import path from 'path'
import fsp from 'fs/promises'

// Types ============================================================

type FSWriteFileData = Parameters<typeof fsp.writeFile>["1"]
type FSWriteFileOptions = Parameters<typeof fsp.writeFile>["2"]
type FSReadFIleOptions = Parameters<typeof fsp.readFile>["1"]

type FSRmOptions = Parameters<typeof fsp.rm>["1"]

// Helpers ==========================================================

const toCWDRelative = (p: string) => path.isAbsolute(p) ? p : path.join(process.cwd(), p)

// Handlers =========================================================

/**
 * Creates a new directory recursively.
 *
 * Alias for `fs.mkdir`
 */
export function mkdir<Event extends E.SoybeanEvent = E.SoybeanEvent>(directory: string | Symbol): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const target = helpers.getStoredValue(e, directory)
            if (e.source === 'task') Terminal.TASK(`mkdir "${target}"`)

            const readyPath = toCWDRelative(target)
            await fsp.mkdir(readyPath, { recursive: true })
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
export function rmdir<Event extends E.SoybeanEvent = E.SoybeanEvent>(directory: string | Symbol): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const target = helpers.getStoredValue(e, directory)
            if (e.source === 'task') Terminal.TASK(`rmdir "${target}"`)

            const readyPath = toCWDRelative(target)
            await fsp.rmdir(readyPath)
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
export function rm<Event extends E.SoybeanEvent = E.SoybeanEvent>(path: string | Symbol, options?: FSRmOptions): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const target = helpers.getStoredValue(e, path)
            if (e.source === 'task') Terminal.TASK(`rm "${target}"`)

            const readyPath = toCWDRelative(target)
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
export function readFile<Event extends E.SoybeanEvent>(file: string | Symbol, saveTo: string, options?: FSReadFIleOptions): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const target = helpers.getStoredValue(e, file)
            if (e.source === 'task') Terminal.TASK(`readfile "${target}"`)

            const readyPath = toCWDRelative(target)
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
export function writeFile<Event extends E.SoybeanEvent = E.SoybeanEvent>(file: string | Symbol, content: FSWriteFileData | Symbol, options?: FSWriteFileOptions): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const fileTarget = helpers.getStoredValue(e, file)
            const contentTarget = helpers.getStoredValue(e, content)
            if (e.source === 'task') Terminal.TASK(`writeFile "${fileTarget}"`)

            const readyPath = toCWDRelative(fileTarget)
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
export function copyFile<Event extends E.SoybeanEvent = E.SoybeanEvent>(src: string | Symbol, dest: string | Symbol, mode?: number): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const srcTarget = helpers.getStoredValue(e, src)
            const destTarget = helpers.getStoredValue(e, dest)
            if (e.source === 'task') Terminal.TASK(`copyFile "${srcTarget}" -> ${destTarget}`)
            
            const srcPath = toCWDRelative(srcTarget)
            const destPath = toCWDRelative(destTarget)
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
export function chmod<Event extends E.SoybeanEvent = E.SoybeanEvent>(path: string | Symbol, mode: string|number): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            const target = helpers.getStoredValue(e, path)
            if (e.source === 'task') Terminal.TASK(`chmod "${target}"`)

            const readyPath = toCWDRelative(target)
            await fsp.chmod(readyPath, mode)
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}
