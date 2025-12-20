declare module 'virtual:git-commits' {
    export interface GitCommit {
        hash: string;
        shortHash: string;
        date: string;
        time: string;
        message: string;
        body: string;
    }
    export const commits: GitCommit[];
}
