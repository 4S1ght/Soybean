
import EventEmitter from 'events'


/**
 * A class built on top of EventEmitter that implements pause/resume functionality.
 */
export default class EventProxy<Event extends string = any> extends EventEmitter {

    // Stores the "pause" state for different events
    private $pause = new Map<string, boolean>()

    constructor() {
        super()
    }

    /** 
     * Synchronously calls all the listeners for the specified event.  
     * Unlike native `emit` it does not emit events paused with the `pause` method.
     */
    public emitSafe(event: Event, ...args: any[]) {
        if (this.$pause.get(event)) return false
        return this.emit(event, ...args)
    }

    /** 
     * Blocks the EventProxy from emitting the specified event. 
     */
    public pause(event: Event) {
        this.$pause.set(event, true)
        return this
    }

    /** 
     * Resumes emitting of an event previously blocked with the `pause` method.
     */
    public resume(event: Event) {
        this.$pause.set(event, false)
        return this
    }


}