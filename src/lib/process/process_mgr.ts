
// ==================================================================

import ChildProcess, { ProcessEvent } from "./child_process.js"
import EventProxy from "./eventproxy.js"

// ==================================================================

export default class ProcessManager extends EventProxy<ProcessEvent> {

    public children = new Map<string, ChildProcess>()
    
    public static instance: ProcessManager
    public static getLiveInstance = () => this.instance

    constructor() {
        super()
        ProcessManager.instance = this
    }

}
