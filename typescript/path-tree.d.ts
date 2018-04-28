export interface IPathTree<T> {
    [key: string]: T;
}
export declare class PathTree<T> {
    private tree;
    add(path: string, value: T): void;
    get(path: string): T | undefined;
    /**
     * Get path tree
     * @return {object}
     */
    getTree(): IPathTree<T>;
    addTree(pathTree: IPathTree<T>): void;
    clear(): void;
    private unifyPath(path);
    private removeExtraSlashes(path);
}
