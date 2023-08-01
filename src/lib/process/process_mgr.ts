
// ==================================================================

import EventProxy from "./eventproxy.js"
import ChildProcess, { ProcessEvent } from "./child_process.js"
import type { SpawnOptions } from "../types.js"

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


}
