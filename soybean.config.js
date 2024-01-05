
import { Soybean } from './build/exports/index.js'
import handlers from './build/exports/handlers.js'

export default Soybean({
    routines: {},
    cp: {
        tsc: { command: ['tsc', '-w'] }
    }
})
