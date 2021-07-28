import * as targets from '../targets';
declare type Targets = typeof targets;
declare type Target = keyof Targets | 'webcomponents' | 'qwik';
declare type FileInfo = {
    path: string;
    content: string;
    target: string;
};
export declare type JSXLiteConfig = {
    type?: 'library';
    targets: Target[];
    dest?: string;
    files?: string | string[];
    mapFile?: (info: FileInfo) => FileInfo | Promise<FileInfo>;
};
export {};
