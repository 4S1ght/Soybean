
import type FS from 'fs'
import type CP from 'child_process'
import type { WatchEventType } from 'fs'

/** Event types used across the map */
export type EventType = 'event' | 'terminal' | 'launch' | 'watcher' | 'child_process'

// Events ===========================================================

export interface SoybeanEvent {
    [key: string]: any
}
export class SoybeanEvent {

    constructor() {
        // Issue: https://github.com/4S1ght/Soybean/issues/11
        // Using a proxy to enable dot/bracket notation instead of e.set() and e.get() for cleaner syntax
        // Only allows getters as setters produce too many conflicts with handler-scoped event properties.
        return new Proxy<SoybeanEvent>(this, {
            get: (target, prop: string) => {
                return target[prop] || target.get(prop)
            }
        })
    }

    /** The event source specifies from where the event had originated from. */
    public source: EventType = 'event'

    /** Stores data shared between grouped event handlers. */
    protected data: Map<string, any> = new Map()

    /**
     * `Event.set` lets you store a piece of data on the event object, letting all the other events in 
     * a group access this data and process it. This allows for operations such as reading a file in one event handler,
     * processing it in the next one and saving it elsewhere.
     * ```javascript
     * // Example
     * group([
     *     handle(e => e.set("key", ["some", "data"]),
     *     handle(e => e.update("key", (data) => ([...data, "!"]))),
     *     handle(e => console.log(g.get("key"))) // => ["some", "data", "!"]
     * ])
     * ```
     */
    public set(itemName: string, data: any) {  
        this.data.set(itemName, data)
    }

    /**
     * `Event.get` lets you retrieve a piece of data saved on the event object.  
     * See `Event.set` documentation for more details.
     * ```javascript
     * // Example
     * group([
     *     // Log the data to the console
     *     handle(e => console.log(g.get("key"))) 
     * ])
     * ```
     */
    public get(itemName: string) {
        return this.data.get(itemName)
    }

    /**
     * `Event.del` lets you delete a piece of data saved on the event object.  
     * See `Event.del` documentation for more details.
     * ```javascript
     * // Example
     * group([
     *     handle(e => e.set("a", "b"))
     *     handle(e => e.del("a"))
     *     // Log the data to the console
     *     handle(e => console.log(g.get("a"))) // => undefined
     * ])
     * ```
     */
    public del(itemName: string) {
        return this.data.delete(itemName)
    }

    /**
     * `Event.update` lets you retrieve a piece of data saved on the event object and then process it.  
     * The data is processed in the callback function which **must** return a reference the modified information.
     * ```javascript
     * // Example
     * group([
     *     handle(e => e.update("key", (data) => data.toString()))
     * ])
     * ```
     */
    public update(itemName: string, callback: <Data = any>(data: Data) => any) {
        const data = this.data.get(itemName)
        this.data.set(itemName, callback(data))
    }

    /**
     * `Event.updateAsync` lets you retrieve a piece of data saved on the event object and then process it asynchronously.  
     * The data is processed in the callback function which **must** return a promise that resolves the modified information.
     * ```javascript
     * // Example
     * group([
     *     handle(e => e.updateAsync("key", async (data) => {
     *         return await doSomethingAsync(data)
     *     }))
     * ])
     * ```
     */
    public async updateAsync(itemName: string, callback: <Data = any>(data: Data) => Promise<any>) {
        const data = this.data.get(itemName)
        this.data.set(itemName, await callback(data))
    }
    
}

export class TerminalEvent extends SoybeanEvent {
    
    public source: 'terminal' = "terminal"
    public argv: string[]
    public argvRaw: string

    constructor(argv: string[]) {

        super()

        this.argv = argv
        this.argvRaw = argv.join(" ")

        this.set('argv', argv)
        this.set('argvRaw', argv.join(" "))

    }
}

export class LaunchEvent extends SoybeanEvent {
    public source: 'launch' = "launch"
    constructor() {
        super()
    }
}

export class WatchEvent extends SoybeanEvent {

    public source: 'watcher' = "watcher"
    public watchEventType: WatchEventType
    public filename: string | null

    constructor(eventType: FS.WatchEventType, filename: string | null) {

        super() 

        this.watchEventType = eventType
        this.filename = filename

        this.set('filename', filename)
        this.set('watchEventType', this.watchEventType)

    }
}

export class ChildProcessEvent extends SoybeanEvent {

    public source: EventType = 'child_process'
    public name: string
    public exitCode: number | null

    constructor(name: string, ref: CP.ChildProcess) {

        super()

        this.name = name
        this.exitCode = ref.exitCode

        this.set('name', name)
        this.set('exitCode', ref.exitCode)

    }

}

// Handlers =========================================================

/** A callback function used by event handlers. */
export interface EventCallback<Event extends SoybeanEvent = SoybeanEvent> {
    (e: Event): Promise<any> | any 
}

/** A function returned when creating a new handler, safely returns an Error or null if successful. */
export interface EventHandler<Event extends SoybeanEvent = SoybeanEvent, Meta = any> {
    (e: Event): Promise<Error | null>
    /** Event handler metadata used to store misc data like help messages. */
    meta?: Meta
}