
/**
 * Extracts command and argv into separate strings.
 */
export const extractCommandArgv = (command: string | string[]): [string, string[]] => {
    if (Array.isArray(command)) {
        const source = [...command]
        const argv = source.splice(1, source.length - 1)
        return [command[0], argv]
    }
    else return [command, []]
}