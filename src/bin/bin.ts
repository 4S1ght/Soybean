#!/usr/bin/env node

import path, { relative } from 'path'
import fs from 'fs'
import url from 'url'
import { program } from 'commander'

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
    .action(async (givenLocation: string = '') => {
        
        const [found, actualLocation, relativeLocation] = (function() {

            const CNF_FILES = [ 'soybean.config.js' ]

            // Check whether a file exists
            const exists = (file: string) => {
                try   { return (fs.statSync(file)).isFile() } 
                catch { return false                           }
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
        
            return [exists(givenLocation), givenLocation, '']

        })()

        if (!found) {
            console.log(`Could not find the configuration file. Path: "${actualLocation}"`)
            process.exit(-1)
        }

        console.log(`Loading "${relativeLocation}"`)

        const link = url.pathToFileURL(actualLocation).href
        const config = await import(link)
        const program = config.exports || config.default || config



    })


program.parse()
