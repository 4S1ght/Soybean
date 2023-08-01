
import z, { union, object, literal, string, number, boolean, array } from 'zod'
import type cp from 'child_process'

/**
 * Child process configuration.
 */
export interface ISpawnOptions extends cp.SpawnOptions {
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
/** 
 * Child process configuration containing all child processes.  
 * Each child's name is derived from the object key it's assigned to.
 * ```typescript
 * {
 *   // Single child process configuration.
 *   "process-name-#1": {
 *     command: ["command", "arg1", "arg2"],
 *     cwd: "./somewhere/else/",
 *     stdout: "all"
 *   }
 * }
 * ``` 
*/
export interface IProcessesConfig {
    [name: string]: ISpawnOptions
}

export const ZSpawnOptions = z.object({
    command: union([ string(), array(string()) ]),
    cwd: string().optional(),
    stdout: union([ literal('all'), z.literal('none') ]).optional(),
    deferNext: number().optional(),
    // Illegal
    stdio: z.string()
})

export const ZProcessesConfig = z.record(string(), ZSpawnOptions)

ZSpawnOptions.parse({
    command: ''
})