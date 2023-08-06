
import { Soybean, handlers } from './build/lib/exports.js'

export default Soybean({
    cp: {
        http: {
            command: ['http-server'],
            cwd: './',
            stdout: 'all'
        }
    },
    terminal: {
        passthroughShell: true,
        handlers: {
            'test': handlers.handle((e) => {
                console.log(`test command, argv:`, e.terminal.argvRaw || 'empty')
            })
        }
    }
})