
/** Event types used across the map */
export type EventType = 'event' | 'terminal' | 'launch'

interface Terminal {
    argvRaw: string
    argv: string[]
}

// Events ===========================================================

export class SoybeanEvent {

    /** 
     * The event source specifies from where the event had originated from. 
    */
    public source: EventType = 'event'

    /** 
     * Contains parameters passed from a live terminal. 
     */
    public terminal: Terminal = {
        argvRaw: "",
        argv: []
    }

    /**
     * Stores data shared between grouped event handlers.
     */
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
    constructor(argv: string[]) {
        super()
        this.terminal.argv = argv
        this.terminal.argvRaw = argv.join(" ")
    }
}

export class LaunchEvent extends SoybeanEvent {
    public source: 'launch' = "launch"
    constructor() {
        super()
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