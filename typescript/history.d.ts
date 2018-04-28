export interface IHitoryOptions {
    baseUrl?: string;
    basePath?: string;
    [key: string]: string;
}
export interface IRequest {
    location: string;
    params: IParams;
    query: IQuery;
    hash: string;
}
export declare type TResolve = (request: IRequest) => Promise<any> | any;
export interface IRoute {
    path: string;
    resolves?: TResolve[];
    callback: (...params: any[]) => any;
}
export interface IParams {
    [key: string]: string;
}
export interface IQuery {
    [key: string]: string;
}
/**
 * Set history options
 * @param options
 */
export declare function setHistoryOptions(options: IHitoryOptions): void;
/**
 * Get an option
 * @param name
 * @return {any}
 */
export declare function getHistoryOption(name: string): string;
/**
 * Start watching popstate event
 */
export declare function startHistory(): void;
/**
 * Check is history started
 * @return {boolean}
 */
export declare function isHistoryStarted(): boolean;
/**
 * Stop watching popstate event
 */
export declare function stopHistory(): void;
export declare function isExernalUrl(path: string): boolean;
/**
 * Add new item to the navigation history
 * @param path
 */
export declare function navigate(path: string): void;
/**
 * Replaces current item in the navigation history
 * @param {string} path
 */
export declare function replace(path: string): void;
/**
 * Removes base path
 * @param path
 * @return {string}
 */
export declare function normalizePath(path: string): string;
/**
 * Gets current location
 * @return {string}
 */
export declare function getLocation(): string;
/**
 * Gets current query
 * @return {object}
 */
export declare function getQuery(): IQuery;
/**
 * Gets current hash
 * @return {string}
 */
export declare function getHash(): string;
/**
 * Get params
 * @param {string} path
 * @return {string}
 */
export declare function getParams(path: string, location: string): IParams;
/**
 * Set hash
 * @param {string} hash
 */
export declare function setHash(hash: string): void;
/**
 * Get request object
 * @param {string} path
 * @return {object}
 */
export declare function getRequest(path: string): IRequest;
/**
 * Open the page by location
 * @param location
 * @return {Promise} A promise that resolves to set destroyer function if any given
 */
export declare function openCurrentLocation(): Promise<any>;
/**
 * Add router
 * @param {object[]} router
 */
export declare function addRouter(router: IRoute[]): void;
/**
 * Clear routs
 */
export declare function clearRoutes(): void;
/**
 * Set default callback
 * @param {function} callback
 */
export declare function setDefaultCallback(callback: () => void): void;
