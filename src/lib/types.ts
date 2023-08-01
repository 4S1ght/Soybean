
import z, { union, object, literal, string, number, boolean, array, record } from 'zod'
import type cp from 'child_process'


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
     * 
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
    deferNext: number().optional()
})

// ==================================================================
//                             CONFIG
// ==================================================================

export interface SoybeanConfig {
    /** Child process configuration. */
    cp?: { [process_name: string]: SpawnOptions }
}

export const ZSoybeanConfig = z.object({
    cp: record(string(), ZSpawnOptions).optional()
})