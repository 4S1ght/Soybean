
/**
 * Extracts command and argv into separate strings.
 */
export const extractCommandArgv = (command: string | string[]): [string, string[]] => {
    const $argv = [...command]
    return Array.isArray(command) ? [$argv.shift()!, $argv] : [command, []]
}