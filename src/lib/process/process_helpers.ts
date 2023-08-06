
/**
 * Extracts command and argv into separate strings.
 */
export const extractCommandArgv = (command: string | string[]): [string, string[]] => {
    if (Array.isArray(command)) return [[...command].shift()!, command]
    else return [command, []]
}