/**
 * Vite plugin to inject git commit history at build time
 */
import { execSync } from 'child_process';

export interface GitCommit {
    hash: string;
    shortHash: string;
    date: string;
    time: string;
    message: string;
    body: string;
}

function getGitCommits(count: number = 20): GitCommit[] {
    try {
        // Format: hash|short|date|subject|body
        // We use --date=format to split date and time
        const format = '%H|%h|%ad|%s|%b';
        const separator = '---COMMIT---';
        const result = execSync(
            `git log -${count} --date=format:"%Y-%m-%d|%H:%M:%S" --format="${format}${separator}"`,
            { encoding: 'utf-8', cwd: process.cwd() }
        );

        return result
            .split(separator)
            .filter(Boolean)
            .map((commit) => {
                const [hash, shortHash, date, time, message, ...bodyParts] = commit.trim().split('|');
                return {
                    hash: hash || '',
                    shortHash: shortHash || '',
                    date: date || '',
                    time: time || '',
                    message: message || '',
                    body: bodyParts.join('|').trim(),
                };
            })
            .filter((c) => c.hash); // Filter out empty entries
    } catch (error) {
        console.warn('Failed to get git commits:', error);
        return [];
    }
}

export function gitCommitsPlugin() {
    const virtualModuleId = 'virtual:git-commits';
    const resolvedVirtualModuleId = '\0' + virtualModuleId;

    return {
        name: 'git-commits',
        resolveId(id: string) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },
        load(id: string) {
            if (id === resolvedVirtualModuleId) {
                const commits = getGitCommits(30);
                return `export const commits = ${JSON.stringify(commits, null, 2)};`;
            }
        },
    };
}
