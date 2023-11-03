
import fs from 'fs'
import path from 'path'
import * as url from 'url'
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

// CONFIGURATION
export const DEFAULT_CONFIGURATION_FILENAME = 'soybean.config.js'
export const CONFIGURATION_FILENAMES = [ DEFAULT_CONFIGURATION_FILENAME ]

// VERSIONS
export const RELEASE_VERSION_STRING = (JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')) as Record<string, string>).version
export const RELEASE_VERSION = RELEASE_VERSION_STRING.split('.').map(x => Number(x)) as [number, number, number]

// SAFEGUARDS
export const BREAKER_INTERVAL_ERROR_MAX_COUNT = 5

export const BREAKER_PROCESS_RESTART_MAX_COUNT = 3
export const BREAKER_PROCESS_RESTART_COOLDOWN = 10 * 1000