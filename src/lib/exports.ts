
import Program from "./program.js"
import { SoybeanConfig, ZSoybeanConfig } from "./types.js"
import * as $handlers from './events/event_handlers.js'

export function Soybean(config: SoybeanConfig) {
    ZSoybeanConfig.parse(config)
    process.title = 'Soybean'
    return new Program(config)
}

export const handlers = $handlers