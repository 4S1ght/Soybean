
import type cp from 'child_process'

/**
 * Custom spawn options
 */
export interface SpawnOptions {
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