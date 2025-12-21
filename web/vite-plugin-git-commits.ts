/**
 * Vite plugin to inject git commit history at build time
 */
import { spawnSync } from 'child_process';

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
        // Format: hash|short|date|time|subject|body
        const format = '%H|%h|%ad||%s|%b';
        const separator = '---COMMIT---';

        const args = [
            '--no-pager',
            'log',
            `-${count}`,
            '--date=format:%Y-%m-%d|%H:%M:%S',
            `--format=${format}${separator}`
        ];

        const output = spawnSync('git', args, {
            encoding: 'utf-8',
            cwd: process.cwd(),
            timeout: 3000, // 3s timeout
            killSignal: 'SIGKILL'
        });

        if (output.error) {
            console.warn('Git log command failed or timed out:', output.error);
            return [];
        }

        if (output.status !== 0) {
            console.warn('Git log process exited with non-zero status:', output.stderr);
            return [];
        }

        return output.stdout
            .split(separator)
            .filter(Boolean)
            .map((commit) => {
                const parts = commit.trim().split('|');
                // Ensure we have enough parts before destructuring
                if (parts.length < 5) return null;

                const [hash, shortHash, date, time, message, ...bodyParts] = parts;
                return {
                    hash: hash || '',
                    shortHash: shortHash || '',
                    date: date || '',
                    time: time || '',
                    message: message || '',
                    body: bodyParts.join('|').trim(),
                };
            })
            .filter((c): c is GitCommit => c !== null && !!c.hash);
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
