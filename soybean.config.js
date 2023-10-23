
import { Soybean } from './build/exports/index.js'
import handlers from './build/exports/handlers.js'

export default Soybean({
    routines: {
        launch: [
            handlers.group([
                handlers.set('x', { hello: "world" }),
                handlers.json.stringify('x'),
                handlers.handle(e => console.log(e.get('x')))
            ]),
            handlers.group([
                handlers.set('x', { hello: "world" }),
                handlers.json.stringify('x', 'y'),
                handlers.handle(e => console.log(e.get('y')))
            ]),
            handlers.group([
                handlers.set('x', { hello: "world" }),
                handlers.json.stringify('x', (x,y,z) => y),
                handlers.handle(e => console.log(e.get('x')))
            ]),
            handlers.group([
                handlers.set('x', { hello: "world" }),
                handlers.json.stringify('x', 'y', (x,y,z) => y),
                handlers.handle(e => console.log(e.get('y')))
            ]),
            handlers.group([
                handlers.set('x', { hello: "world" }),
                handlers.json.stringify('x', 'y', 4),
                handlers.handle(e => console.log(e.get('y')))
            ]),
            handlers.group([
                handlers.set('x', { hello: "world" }),
                handlers.json.stringify('x', 'y', (x,y,z) => y, 4),
                handlers.handle(e => console.log(e.get('y')))
            ])
        ],
    }
})
