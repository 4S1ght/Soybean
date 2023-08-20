
import c from 'chalk'

type ChalkColor = "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "grey" | "gray"

export default class Terminal {

    private static bleach = (text: string) => text.replace(/\x1B\[\d+m/g, '')

    // GENERAL ------------------------------------------------------

    public static info  = (...msg: string[]) => console.log(c.grey(msg.join(' ')))
    public static warn  = (...msg: string[]) => console.log(c.yellow(msg.join(' ')))
    public static error = (...msg: string[]) => console.log(c.red(msg.join(' ')))

    /** Shows an info message. */
    public static INFO  = (...msg: string[]) => console.log(`${c.blue('INFO')} ${c.grey(msg.join(' '))}`)
    /** Shows a warning. */
    public static WARN  = (...msg: string[]) => console.log(`${c.yellow('WARN')} ${msg.join(' ')}`)
    /** Displays an exit message for processes and tasks */
    public static EXIT  = (...msg: string[]) => console.log(`${c.red('EXIT')} ${msg.join(' ')}`)
    /** Displays an information message when a task is being executed. */
    public static TASK  = (...msg: string[]) => console.log(`${c.green('TASK')} ${c.grey(msg.join(' '))}`)
    /** Displays an information message when a command handler is being called. */
    public static CMD  = (...msg: string[]) => console.log(`${c.green('CMD')} ${c.grey(msg.join(' '))}`)

    public static EXIT_HARD = (...msg: string[]) => { console.log(`${c.red('EXIT')} ${msg.join(' ')}`); process.exit() }
    /** 
     * Shows an error message.
     * Thrown errors should be passed to the last parameter to be displayed correctly.
     */
    public static ERROR = (...msg: (string|Error)[]) => {
        const error = msg[msg.length - 1] instanceof Error ? msg.pop() as Error : null;
        console.log(c.red(`ERR ${msg.join(' ')}`))
        if (error) console.log(error)
    }

    // UTILITY LOGS -------------------------------------------------
    
    /** Prints out a border-less table. */
    public static table(rows: Record<string, string|number>[]) {

        const maxWidths: Record<string, number> = {}
        const updateWidth = (field: string, value: string) => maxWidths[field] = Math.max(maxWidths[field] || 0, value.replace(/\x1B\[\d+m/g, '').length + 3)
        const toWidth = (string: string, length: number) => `${string}${' '.repeat(Math.abs(string.replace(/\x1B\[\d+m/g, '').length - length))}`

        rows.forEach(row => {
            Object.keys(row).forEach(column => {
                updateWidth(column, column)
                updateWidth(column, row[column].toString())
            })
        })
        
        console.log(Object.keys(maxWidths).map(x => toWidth(x, maxWidths[x])).join(''))

        rows.forEach(row => {
            console.log(Object.entries(row).map(x => toWidth(x[1].toString(), maxWidths[x[0]])).join(''))
        })
    }

    public static box(padding = 0, border: ChalkColor, ...lines: string[]) {

        const cl = c[border]

        const padX = padding
        const padY = Math.floor(padding / 2)
        const padH = ' '.repeat(padding)

        const maxLength = Math.max(...lines.map(line => this.bleach(line).length))
        const padEnd = (string: string) => `${string}${' '.repeat(Math.abs(maxLength - this.bleach(string).length))}`

        const horizontalGap = " ".repeat((maxLength + 2) + (padding * 2))
        const horizontalBorder = cl(horizontalGap.replace(/ /g, "─"))
        const topBorder = cl(`┌${horizontalBorder}┐`)
        const bottomBorder = cl(`└${horizontalBorder}┘`)
        const wrappedText = lines.map(line => `${cl("│")}${padH} ${padEnd(line)} ${padH}${cl("│")}`).join("\n")

        const gapY = () => {
            for (let i = 0; i < padY; i++) {
                console.log(`${cl("│")}${horizontalGap}${cl("│")}`)
            }
        }

        console.log(topBorder)
        gapY()
        console.log(wrappedText)
        gapY()
        console.log(bottomBorder)

    }

}