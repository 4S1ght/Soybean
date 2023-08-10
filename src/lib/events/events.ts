
/** Event types used across the map */
export type EventType = 'event' | 'terminal' | 'task'

interface Terminal {
    argvRaw: string
    argv: string[]
}

// Events ===========================================================

export class SoybeanEvent {
    /** The event source specifies from where the event had originated from. */
    public source: EventType = 'event'
    /** Contains parameters passed from a live terminal. */
    public terminal: Terminal = {
        argvRaw: "",
        argv: []
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