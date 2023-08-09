
// Imports ==========================================================

import c from 'chalk'

import * as h from '../events/event_handlers.js'
import Terminal from './terminal.js'
import Manager from '../process/process_mgr.js'
import Program from '../program.js'

import type * as E from '../events/events.js'

// Types ============================================================

type CommandMeta = {
    cat:   string
    usage: string
    desc:  string
}

// Misc =============================================================

/**
 * Converts time in milliseconds to a hh:mm:ss string.
 */
export const msToStringTime = (ms: number) => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    const units: string[] = []
    h > 0 && units.push(`${h}h`)
    m > 0 && units.push(`${m.toString().length === 2 ? m : '0' + m}m`)
    s > 0 && units.push(`${s.toString().length === 2 ? s : '0' + s}s`)
    return units.join(' ')
}

// Exports ==========================================================

const commands: Record<string, E.EventHandler<E.TerminalEvent, CommandMeta>> = {

    // MISCELLANEOUS ==============================================
    
    "help": h.handle<E.TerminalEvent, CommandMeta>(async (e) => {
        
        const command = commands[e.terminal.argv[0]] as E.EventHandler<E.TerminalEvent, CommandMeta> | undefined

        if (e.terminal.argv[0] && command && command.meta) {
            console.log(`  ${command.meta.usage}`)
            console.log(`  - ${c.grey(command.meta.desc)}`)
        }
        else if (!e.terminal.argv[0]) {

            const commandInfo: Record<string, Array<[string, string]>> = {}
            const gap   = 4,
                gapCat  = 2,
                gapDesc = 4,
                gapEnd  = 5
            
            let maxUsageStringLength: number = 0

            const space = (amount: number) => new Array(amount).fill(' ').join('')

            const wrapTextLines = (text: string, offset: number, lineLength: number) => {

                const words: string[] = text.split(' '), lines: string[] = []
                let currentLine = ''

                for (let i = 0; i < words.length; i++) {
                    const word = words[i]
                    if (currentLine.length + word.length <= lineLength) {
                        currentLine += (currentLine.length > 0 ? ' ' : '') + word
                    }
                    else {
                        lines.push(currentLine)
                        currentLine = word
                    }
                }

                if (currentLine.length > 0) lines.push(currentLine)
                return lines.join(`\n${space(offset)}`)

            }

            for (const name in commands) {
                if (Object.prototype.hasOwnProperty.call(commands, name)) {
                    const command = commands[name]
                    if (command && command.meta) {
                        if (!commandInfo[command.meta.cat]) commandInfo[command.meta.cat] = []
                        commandInfo[command.meta.cat].push([command.meta.usage, command.meta.desc])
                        maxUsageStringLength = Math.max(command.meta.usage.length + gap, maxUsageStringLength)
                    }
                }
            }

            const finishedMessage: string[] = []

            finishedMessage.push(`\n${space(gapCat)}─── Controls ───\n`)

            const controls: string[] = [
                `• Use ${c.red('← →')}, ${c.red('backspace')} and ${c.red('delete')} keys to edit your input.`,
                `• Use ${c.red('↓ ↑')} keys to navigate through command history.`,
                `• Double-press ${c.red('CTRL + C')} to exit soybean.`,
                `• Double-press ${c.red('ESC')} to restart the passthrough shell process if it gets stuck, dies or is unresponsive.`
            ]
            controls.forEach(x => {
                finishedMessage.push(c.grey(`${space(gapCat)}${wrapTextLines(x, gapCat, process.stdout.columns - gapEnd)}`))
            })

            finishedMessage.push(`\n${space(gapCat)}─── Commands ───`)

            // Display user-specified handlers if any have been configured.
            if (Program.getLiveInstance().config.terminal)
            if (Program.getLiveInstance().config.terminal?.handlers) {
                const commands = Object.keys(Program.getLiveInstance().config.terminal?.handlers!).join(', ')
                finishedMessage.push(`\n${space(gapCat)}User-specified:`)
                finishedMessage.push(c.grey(`${space(gapDesc)}${wrapTextLines(commands, maxUsageStringLength + gapDesc, process.stdout.columns - maxUsageStringLength - gapEnd)}`))
            }

            // Display category and info list for all the built-in commands.
            Object.keys(commandInfo).forEach(cat => {
                const list = commandInfo[cat]
                list.map(x => x[0] = x[0] + Array(maxUsageStringLength - x[0].length).fill(' ').join(''))
                finishedMessage.push(`\n${space(gapCat)}${cat}`)
                list.forEach(x => {
                    finishedMessage.push(c.grey(`${space(gapDesc)}${x[0]}${wrapTextLines(x[1], maxUsageStringLength + gapDesc, process.stdout.columns - maxUsageStringLength - gapEnd)}`))
                })
            })

            console.log([...finishedMessage, ''].join('\n'))

        }
        else {
            Terminal.error(`Command "${e.terminal.argv[0]} does not exist.`)
        }

    }, {
        cat: 'Misc',
        usage: 'help <command?>',
        desc: 'Shows help information, or information specific to the selected command.'
    }),
    
    "quit": h.handle<E.TerminalEvent, CommandMeta>(async (e) => {
        Program.getLiveInstance().shutdown()
    }, {
        cat: 'Misc',
        usage: 'quit',
        desc: 'Exits Soybean gracefully. Double-press CTRL+C alternatively.'
    }),

    // PROCESS MANAGEMENT =========================================

    "kl": h.handle<E.TerminalEvent, CommandMeta>(async (e) => {

        if (!e.terminal.argv[0]) return Terminal.error('Unspecified process name.')

        const mgr = Manager.getLiveInstance()
        const processName = e.terminal.argv[0] || ""
        const process = mgr.children.get(processName)

        if (!process) return Terminal.error(`Could not find process "${processName}".`)
        if (process.status !== 'alive') return Terminal.error(`Process "${processName}" is not alive.`)
        
        Terminal.info(`Killing process...`)
        await process.kill()

    }, {
        cat: 'Process management',
        usage: 'kl <process>',
        desc: 'Kills a child process of a given name.'
    }),

    "rv": h.handle<E.TerminalEvent, CommandMeta>(async (e) => {
        
        if (!e.terminal.argv[0]) return Terminal.error('Unspecified process name.')

        const mgr = Manager.getLiveInstance()
        const processName = e.terminal.argv[0]
        const process = mgr.children.get(processName)

        if (!process)                                       return Terminal.error(`Could not find process "${processName}".`)
        if (['alive', 'awaiting'].includes(process.status)) return Terminal.error(`Process "${processName}" is not dead.`)
        
        Terminal.info(`Reviving process...`)
        process.revive()

    }, {
        cat: 'Process management',
        usage: 'rv <process>',
        desc: 'Revives a child process of a given name, that was previously killed with the "kl" command.'
    }), 

    "rs": h.handle<E.TerminalEvent, CommandMeta>(async (e) => {
        
        if (!e.terminal.argv[0]) return Terminal.error('Unspecified process name.')

        const mgr = Manager.getLiveInstance()
        const processName = e.terminal.argv[0]
        const process = mgr.children.get(processName)

        if (!process) return Terminal.error(`Could not find process "${processName}".`)

        Terminal.info(`Restarting process...`)
        await process.restart()

    }, {
        cat: 'Process management',
        usage: 'rs <process>',
        desc: 'Restarts a child process.'
    }),

    "pcs": h.handle<E.TerminalEvent, CommandMeta>(async () => {

        const cStatus: Record<string, (x: string) => string> = { alive: c.green, dead: c.red, killed: c.red, awaiting: c.magenta }

        const processes = Manager.getLiveInstance().getStatusList().map(x => ({
            name:        c.grey(x.name),
            status:      cStatus[x.status](x.status),
            uptime:      c.grey(msToStringTime(x.uptime)),
            pid:         c.yellow(x.pid) || c.grey('-'),
            'exit-code': typeof x.exitCode === 'number' ? c.yellow(x.exitCode) : c.grey('-'),
            spawnargs:   c.grey(x.spawnargs.join(' '))
        }))

        processes.length ? Terminal.table(processes) : Terminal.info('No child processes configured.')

    }, {
        cat: 'Process management',
        usage: 'pcs',
        desc: 'Lists all child processes, their status, uptime, etc...'
    })

}

export default commands