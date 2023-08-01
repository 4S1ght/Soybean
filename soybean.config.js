
import { Soybean } from './build/lib/exports.js'

export default Soybean({
    cp: {
        tsc: {
            command: 'http-server',
            cwd: './',
            stdout: 'all'
        }
    }
})