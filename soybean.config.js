
import { Soybean } from './build/exports/index.js'
import handlers from './build/exports/handlers.js'

export default Soybean({
    cp: {
        http: {
            command: ['http-server'],
            cwd: './',
            stdout: 'none'
        }
    },
    terminal: {
        passthroughShell: true,
        keepHistory: 100,
        handlers: {
            'test': handlers.handle((e) => {
                console.log(`test command, argv:`, e.terminal.argv.join('|') || 'empty')
            }),
            'rd': handlers.group([
                handlers.fs.readdir('./build/exports/index.js', 'index'),
                handlers.fs.rm('./build/exports/index.js')
            ])
        }
    }
})
