#!/usr/bin/env node

import type Program from '../lib/program.js'

import path from 'path'
import fs from 'fs'
import url from 'url'
import c from 'chalk'
import { program } from 'commander'
import Terminal from '../lib/terminal/terminal.js'
import * as constants from '../constants.js'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const __package: Package = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'))

interface Package {
    name: string
    version: string
    description: string
}

// ==================================================================

function getConfigLocation(givenLocation: string = ''): [boolean, string, string] {


    // Set givenLocation to the default config file name if it is 
    // an optional parameter, such as --experimental-fetch.
    if (/--.+/.test(givenLocation)) givenLocation = constants.CONFIGURATION_FILENAMES[0]

    // Check whether a file exists
    const exists = (file: string) => {
        try   { return (fs.statSync(file)).isFile() } 
        catch { return false }
    }

    let isAbs = path.isAbsolute(givenLocation)
    let bName = path.basename(givenLocation)

    // Default to CWD as the root dir if the path is relative
    if (!isAbs) givenLocation = path.join(process.cwd(), givenLocation) 

    if (!path.extname(bName)) {
        for (let i = 0; i < constants.CONFIGURATION_FILENAMES.length; i++) {
            const filename = path.join(givenLocation, constants.CONFIGURATION_FILENAMES[i])
            if (exists(filename)) return [true, filename, path.relative(process.cwd(), filename)]
        }
    }

    return [exists(givenLocation), givenLocation, '']

}

// ==================================================================

program
    .name(__package.name)
    .version(`Soybean ${__package.version}`, `-v, --version`)
    .description(__package.description)

program
    .command("run [config-file]")
    .description('Initialize soybean with specified config file')
    .allowUnknownOption()
    .action(async (givenLocation: string = '') => {
        
        const [found, actualLocation, relativeLocation] = getConfigLocation(givenLocation)
        if (!found) return Terminal.EXIT_HARD(`Could not find the configuration file. Path: "${actualLocation}"`)

        Terminal.box(1, 'blue', `Soybean ${c.grey("v"+__package.version)}`)
        Terminal.INFO(`Loading "${relativeLocation}"`)

        const link = url.pathToFileURL(actualLocation).href
        const module = await import(link)
        const program: Program = module.exports || module.default || module
        const cwd = path.dirname(relativeLocation)

        if (program.$$SOYBEAN_RELEASE && Array.isArray(program.$$SOYBEAN_RELEASE)) {
            if (constants.RELEASE_VERSION[0] === program.$$SOYBEAN_RELEASE[0]) return program.start(cwd)
            Terminal.EXIT_HARD(`Conflicting Soybean instance versions. Global: v${constants.RELEASE_VERSION_STRING}, local: ${program.$$SOYBEAN_RELEASE.join('.')}`)
        }
        
        Terminal.EXIT_HARD(`Used configuration file must export a program instance created with the "Soybean" function.`)

    })

program
    .command("init [config-file]")
    .option('-f, --force', 'Generate a config file forcefully.')
    .description('Initialize soybean with specified config file')
    .action(async (givenLocation, flags) => {

        const [found, actualLocation] = getConfigLocation(givenLocation)
        if (found && !flags.force) return Terminal.EXIT_HARD(`A configuration file already exists in this location. Use -f to force the creation of a new one.`)

        const template = path.join(__dirname, '../../templates/soybean.config.js')
        const destination = found ? actualLocation : path.join(actualLocation, constants.DEFAULT_CONFIGURATION_FILENAME)
        await fs.promises.copyFile(template, destination)
        
        Terminal.INFO(`Created a file in "${destination}"`)

    })


program.parse()
