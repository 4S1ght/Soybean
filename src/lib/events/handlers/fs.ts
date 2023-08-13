
// Imports ===========================================================

import Terminal from '../../terminal/terminal.js'
import type * as E from '../events.js'

import path from 'path'
import fsp from 'fs/promises'

// Types ============================================================

type FSWriteFileData = Parameters<typeof fsp.writeFile>["1"]
type FSWriteFileOPtions = Parameters<typeof fsp.writeFile>["2"]

type FSRmOptions = Parameters<typeof fsp.rm>["1"]

// Helpers ==========================================================

const toCWDRelative = (p: string) => path.isAbsolute(p) ? p : path.join(process.cwd(), p)

// Handlers =========================================================

/**
 * Creates a new directory recursively.
 *
 * Alias for `fs.mkdir`
 */
export function mkdir<Event extends E.SoybeanEvent = E.SoybeanEvent>(directory: string): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            if (e.source === 'task') Terminal.TASK(`mkdir "${directory}"`)
            const readyPath = toCWDRelative(directory)
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
export function rmdir<Event extends E.SoybeanEvent = E.SoybeanEvent>(directory: string): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            if (e.source === 'task') Terminal.TASK(`rmdir "${directory}"`)
            const readyPath = toCWDRelative(directory)
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
export function rm<Event extends E.SoybeanEvent = E.SoybeanEvent>(path: string, options?: FSRmOptions): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            if (e.source === 'task') Terminal.TASK(`rm "${path}"`)
            const readyPath = toCWDRelative(path)
            await fsp.rm(readyPath, options)
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
export function writeFile<Event extends E.SoybeanEvent = E.SoybeanEvent>(file: string, content: FSWriteFileData, options?: FSWriteFileOPtions): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            if (e.source === 'task') Terminal.TASK(`writeFile "${file}"`)
            const readyPath = toCWDRelative(file)
            await fsp.writeFile(readyPath, content, options)
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
export function copyFile<Event extends E.SoybeanEvent = E.SoybeanEvent>(src: string, dest: string, mode?: number): E.EventHandler<Event> {
    return (e) => new Promise<null | Error>(async end => {
        try {
            if (e.source === 'task') Terminal.TASK(`copyFile "${path}"`)
            const srcPath = toCWDRelative(src)
            const destPath = toCWDRelative(dest)
            await fsp.copyFile(srcPath, destPath, mode)
            end(null)
        }
        catch (error) {
            end(error as Error)
        }
    })
}
