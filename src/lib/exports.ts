
import Program from "./program.js"
import { SoybeanConfig, ZSoybeanConfig } from "./types.js"

export function Soybean(config: SoybeanConfig) {
    ZSoybeanConfig.parse(config)
    process.title = 'Soybean'
    return new Program(config)
}