
import { Soybean } from './build/exports/index.js'
import handlers from './build/exports/handlers.js'

export default Soybean({
    routines: {
        launch: [
            handlers.group([
                handlers.fs.readdir('./src', 'src'),
                handlers.handle(x => console.log(x))
            ])
        ],
    }
})
