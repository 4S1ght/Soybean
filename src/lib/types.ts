
import z, { union, object, literal, string, number, boolean, array, record } from 'zod'
import type cp from 'child_process'
import type { EventHandler, TerminalEvent } from './events/events.js'

// ==================================================================
//                       TYPE EQUALITY GUARDS
// ==================================================================

export function assert<T extends never>() {}
type TypeEqualityGuard<A, B> = Exclude<A, B> | Exclude<B, A>

assert<TypeEqualityGuard<{}, {}>>()

// ==================================================================
//                        CHILD PROCESSES
// ==================================================================

/**
 * Child process configuration.
 */
export interface SpawnOptions extends Omit<cp.SpawnOptions, 'stdio'> {
    /** 
     * Shell command that summons a CLI app or child script.
     * ```js
     * // Single command 
     * { command: "tsc" }
     * // Command with arguments
     * { command: ["tsc", "-w"] }
     * ```
     */
    command: string | string[]
    /** 
     * Specifies the current working directory for the spawned process. 
     * Note: This value can be either a static path, or a relative one, in which 
     * case it will work relative to the `cwd` of the master soybean process.
     */
    cwd?: string
    /** 
     * Specifies whether `STDOUT` should be ignored or piped to the main process.
     * Setting this option to `all` will show all the process output in the terminal.
     */
    stdout?: 'all' | 'ignore'
    /** 
     * Determines how long to wait before spawning the next child 
     * process after the current one had started (in milliseconds)
     */
    deferNext?: number

}

export const ZSpawnOptions = z.object({
    command: union([ string(), array(string()) ]),
    cwd: string().optional(),
    stdout: union([ literal('all'), z.literal('none') ]).optional(),
    deferNext: number().optional(),
    // Illegal
    stdio: z.undefined()
})

// ==================================================================
//                            TERMINAL
// ==================================================================

/** 
 * Live terminal configuration.
 */
export interface LiveTerminalSettings {
    /** 
     * If `true`, a terminal instance will be created in the background and all unknown commands
     * will be passed through to it.
     * 
     * The background terminal will use the default OS shell, such as `/bin/zsh/` on MacOS or `/bin/bash` on Linux
     * unless specified by replacing the `true/false` value with a string referring to a shell such as `powershell.exe`. 
     * ```js
     * // Use default OS shell
     * { passthroughShell: true }
     * // Use a specific shell
     * { passthroughShell: "/bin/bash" } 
     * ```
     * 
     * **NOTE:** The background shell is a live instance. Unknown commands are not executed individually, instead 
     * they're passed into the live shell instance. Double-press ESC (escape) to restart the background shell if required.
     * */
    passthroughShell?: boolean | string
    /** 
     * Specifies custom terminal commands
     */
    handlers?: Record<string, EventHandler<TerminalEvent>>
    /** 
     * If specified, a number of used commands used will be retained in the history.
     * 
     * **Note:** The history is scoped to the specific Soybean installation. This means that the history can be scoped
     * to a specific project with a local installation or globally when installed to global `node_modules` in the user directory.
    */
    keepHistory?: number
}

export const ZLiveTerminalSettings = z.object({
    passthroughShell: union([ boolean(), string() ]).optional(),
    handlers: record(string(), z.function()).optional(),
    keepHistory: number().optional()
})

// ==================================================================
//                             CONFIG
// ==================================================================

export interface SoybeanConfig {
    /** Child process configuration. */
    cp?: { [process_name: string]: SpawnOptions }
    /** Live terminal configuration. */
    terminal?: LiveTerminalSettings
}

export const ZSoybeanConfig = z.object({
    cp: record(string(), ZSpawnOptions).optional(),
    terminal: ZLiveTerminalSettings.optional()
})
