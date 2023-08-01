
// ==================================================================

import EventProxy from "./eventproxy.js"
import cp from 'child_process'
import treeKill from 'tree-kill'
import { extractCommandArgv } from "./process_helpers.js"

import type { ISpawnOptions } from "../types/process_config.js"

// ==================================================================

export type ProcessEvent = 'spawn' | 'close' | 'kill' | 'kill-error' | 'restart' | 'restart-error'
export type ProcessStatus = 'awaiting' | 'alive' | 'dead' | 'killed'

// ==================================================================

export default interface ChildProcess {
    on(event: 'spawn',          callback: () => any): this
    on(event: 'close',          callback: () => any): this
    on(event: 'kill',           callback: () => any): this
    on(event: 'restart',        callback: () => any): this
    on(event: 'kill-error',     callback: (err: Error) => any): this
    on(event: 'restart-error',  callback: (err: Error) => any): this
}
export default class ChildProcess extends EventProxy<ProcessEvent> {

    public declare ref: cp.ChildProcess
    public declare alive: boolean

    public name: string
    public spawnOptions: ISpawnOptions
    public spawnTime: number = -1
    public deathTime: number = -1

    public status: ProcessStatus = 'awaiting'
    public restarted = false

    constructor(name: string, spawnOptions: ISpawnOptions) {
        super()
        this.name = name
        this.spawnOptions = spawnOptions
    }

    private registerEvents() {

        const self = this

        this.ref.on('spawn', () => {
            self.alive = true
            self.status = 'alive'
            self.spawnTime = Date.now()
            self.emitSafe('spawn')
            // Resume "close" because it might have been paused by kill()
            self.resume('spawn')
        })

        this.ref.on('exit', () => {
            self.alive = false
            self.deathTime = Date.now()
            if (self.status !== 'killed') self.status = 'dead'
            // "close" doesn't fire if child was killed manually
            self.emitSafe('close')
            self.pause('close')
        })

    }

    public spawn = () => {

        const [cmd, argv] = extractCommandArgv(this.spawnOptions.command)

        this.ref = cp.spawn(cmd, argv, {
            ...this.spawnOptions,
            shell: true,
            stdio: ['all', undefined].includes(this.spawnOptions.stdout) 
                ? ['ignore', 'inherit', 'inherit'] 
                : ['ignore', 'ignore', 'ignore'],
        })  

        this.registerEvents()
        return this

    }

    public kill(silent = false) {
        return new Promise<Error | void>(resolve => {

            this.pause('close')
    
            treeKill(this.ref.pid!, error => {
                if (error) {
                    this.emitSafe('kill-error', error)
                    this.resume('close')
                    resolve(error)
                }
                else {
                    this.status = 'killed'
                    if (!silent) this.emitSafe('kill')
                    resolve()
                }
            })

        })
    }

    public restart() {
        return new Promise<Error | void>(resolve => {

            this.pause('close')
            this.pause('spawn')
            this.restarted = true

            treeKill(this.ref.pid!, error => {
                if (error) {
                    this.emitSafe('restart-error', error)
                    this.resume('close')
                    resolve(error)
                }
                else {
                    this.spawn()
                    this.registerEvents()
                    this.emitSafe('restart')
                    resolve()
                }
            })

        })
    }

    public revive() {
        if (this.status === 'alive' || this.status === 'awaiting') return
        this.restarted = true
        this.spawn()
        return this
    }



}