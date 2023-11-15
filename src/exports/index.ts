
import * as h from '../lib/events/handlers.js'
import Program from "../lib/program.js"
import { SoybeanConfig, ZSoybeanConfig } from "../lib/types.js"

export function Soybean(config: SoybeanConfig) {
    ZSoybeanConfig.parse(config)
    process.title = 'Soybean'
    return new Program(config)
}

export const handlers = {
    ...h.misc,
    shell:  h.shell,
    fs:     h.fs,
    cp:     h.cp,
    json:   h.json,
    net:    h.net,
    os:     h.os
}
