
import { Soybean } from './build/exports/index.js'
import handlers from './build/exports/handlers.js'

export default Soybean({
    routines: {
        launch: [
            handlers.group([
                handlers.fs.readFile('./package.json', 'package'),
                handlers.json.parse('package', 'package', (t, k, v) => typeof k === 'string' ? "#-"+k : k),
                handlers.handle(e => console.log('package.version:', e.get('package').version))
            ])
        ],
        watch: [ 
            {
                file: './',
                options: { rateLimiter: 1500 },
                handle: handlers.group([
                    handlers.handle(e => e.set('file', e.watch.filename)),
                    handlers.fs.mkdir('./test'),
                    handlers.fs.copyFile('./soybean.config.js', './test/soybean.config.js'),
                    handlers.cp.restart('http'),
                    handlers.handle(e => console.log(e))
                ])
            } 
        ]
    },
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
            'test': handlers.group([
                handlers.fs.readFile('./build/lib/exports.js', 'exports', 'utf-8'),
                handlers.handle(e => e.update('exports', x => '---\nThe exports file:\n---\n' + x)),
                handlers.fs.mkdir('./test'),
                handlers.fs.writeFile('./test/exports.txt', Symbol('exports')),
            ])
        }
    }
})
