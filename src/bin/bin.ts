#!/usr/bin/env node

import path from 'path'
import fs from 'fs'
import url from 'url'
import c from 'chalk'
import { program } from 'commander'
import Terminal from '../lib/terminal/terminal.js'
import Program from '../lib/program.js'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const __package: Package = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'))

interface Package {
    name: string
    version: string
    description: string
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
        
        const [found, actualLocation, relativeLocation] = (function() {

            const CNF_FILES = [ 'soybean.config.js' ]

            // Set givenLocation to the default config file name if it is 
            // an optional parameter, such as --experimental-fetch.
            if (/--.+/.test(givenLocation)) givenLocation = CNF_FILES[0]

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
                for (let i = 0; i < CNF_FILES.length; i++) {
                    const filename = path.join(givenLocation, CNF_FILES[i])
                    if (exists(filename)) return [true, filename, path.relative(process.cwd(), filename)]
                }
            }
        
            console.log(exists(givenLocation), givenLocation, '')
            return [exists(givenLocation), givenLocation, '']

        })()

        if (!found) return Terminal.EXIT_HARD(`Could not find the configuration file. Path: "${actualLocation}"`)

        Terminal.box(1, 'blue', `Soybean ${c.grey("v"+__package.version)}`)
        Terminal.INFO(`Loading "${relativeLocation}"`)

        const link = url.pathToFileURL(actualLocation).href
        const module = await import(link)
        const program: Program = module.exports || module.default || module
        const cwd = path.dirname(relativeLocation)

        if (program instanceof Program === false) Terminal.EXIT_HARD(`Used configuration file must export a program instance created with the "Soybean" function.`)

        program.start(cwd)

    })


program.parse()
