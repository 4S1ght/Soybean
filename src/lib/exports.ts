
import Program from "./program.js"
import { SoybeanConfig, ZSoybeanConfig } from "./types.js"

export function Soybean(config: SoybeanConfig) {
    ZSoybeanConfig.parse(config)
    return new Program(config)
}