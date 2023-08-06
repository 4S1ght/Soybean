
import Program from "../lib/program.js"
import { SoybeanConfig, ZSoybeanConfig } from "../lib/types.js"

export function Soybean(config: SoybeanConfig) {
    ZSoybeanConfig.parse(config)
    process.title = 'Soybean'
    return new Program(config)
}
