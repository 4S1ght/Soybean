
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
                console.log(`test command, argv:`, e.terminal.argvRaw || 'empty')
            }),
            'npm-init': handlers.group([
                handlers.shell.spawn(['npm', 'init'], {
                    stdio: 'takeover',
                    cwd: './test',
                    shell: 'cmd.exe'
                })
            ])
        }
    }
})
