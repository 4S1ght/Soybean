
// ==================================================================

import EventProxy from "./eventproxy.js"
import Terminal from "../terminal/terminal.js"
import ChildProcess, { ProcessEvent } from "./child_process.js"
import type { SpawnOptions } from "../types.js"

// ==================================================================

interface ProcessInfo {
    name:       string
    status:     string
    ipc:        boolean
    pid:        number | undefined
    uptime:     number
    spawnargs:  string[]
    exitCode:   number | null
}

// ==================================================================

const wait = (time: number) => new Promise<void>(end => {
    setTimeout(end, time)
})

// ==================================================================

export default class ProcessManager extends EventProxy<ProcessEvent> {

    public children = new Map<string, ChildProcess>()
    
    public static instance: ProcessManager
    public static getLiveInstance = () => this.instance

    constructor(public config?: Record<string, SpawnOptions>) {
        super()
        ProcessManager.instance = this
    }

    public createChildInstances() {

        if (!this.config) return

        let processNames = Object.keys(this.config)

        // Replace all spaces in child process names inside the imported
        // config object so they can be accessed through the live terminal.
        for (let i = 0; i < processNames.length; i++) {
            const name = processNames[i]
            if (name.includes(' ')) {
                const newName = name.replace(/ /g, '_')
                this.config![newName] = this.config![name]
                delete this.config![name]
            }
        }

        processNames = Object.keys(this.config)

        for (let i = 0; i < processNames.length; i++) {
            const name = processNames[i]
            const config = this.config![name]
            this.children.set(name, new ChildProcess(name, config))
        }

    }

    public async startEach(callback: (process: ChildProcess) => any) {

        const spawnProcess = (name: string) => new Promise<ChildProcess>(async (resolve) => {
            const process = this.children.get(name)!
            if (callback) await callback(process)
            process.on('spawn', () => {
                this.emitSafe('spawn', name)
                resolve(process)
            })
            process.spawn()
        })

        for (let [name, process] of this.children) {
            await spawnProcess(name)
            await wait(process.spawnOptions.deferNext || 300)
        }

    }

    /**
     * Returns a list child processes and their information and status.
     */
    public getStatusList() {

        const fields: ProcessInfo[] = []

        this.children.forEach(x => {
            fields.push({
                name:       x.name,
                status:     x.status,
                ipc:        Boolean(x.ref.channel),
                pid:        x.ref.pid,
                uptime:     ['dead', 'killed'].includes(x.status) ? x.deathTime - x.spawnTime : Date.now() - x.spawnTime,
                spawnargs:  x.ref.spawnargs,
                exitCode:   x.ref.exitCode,
            })
        })

        return fields

    }

    /**
     * Attempts to close all running processes.
     */
    public async closeAll(): Promise<Error | void> {

        const processes = this.children.entries()

        try {
            for (const [name, process] of processes) {
                if (['awaiting', 'alive'].includes(process.status)) {
                    Terminal.EXIT(`Shutting process "${name}"...`)
                    await process.kill(true)
                }
            }
        } 
        catch (error) {
            return error as Error
        }

    }

}
