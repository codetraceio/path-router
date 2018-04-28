import { IPathTree, PathTree } from "./path-tree";

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

export type TResolve = (request: IRequest) => Promise<any> | any;

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

const defaultOptions: IHitoryOptions = {
  baseUrl: "/",
  basePath: "",
};
const pathTree: PathTree<IRoute> = new PathTree<IRoute>();
const events = {};

let currentOptions: IHitoryOptions = {};
let started: boolean = false;
let listener: any = null;
let defaultCallback: () => void = () => {};

/**
 * Set history options
 * @param options
 */
export function setHistoryOptions(options: IHitoryOptions): void {
  currentOptions = {...defaultOptions, ...options};
}

/**
 * Get an option
 * @param name
 * @return {any}
 */
export function getHistoryOption(name: string): string {
    return currentOptions[name];
}

/**
 * Start watching popstate event
 */
export function startHistory(): void {
  openCurrentLocation();
  listener = window.addEventListener("popstate", () => {
    openCurrentLocation();
  }, false);
  started = true;
}

/**
 * Check is history started
 * @return {boolean}
 */
export function isHistoryStarted(): boolean {
    return started;
}

/**
 * Stop watching popstate event
 */
export function stopHistory(): void {
  window.removeEventListener("popstate", listener);
  started = false;
}

export function isExernalUrl(path: string): boolean {
  return currentOptions.basePath && path.indexOf(currentOptions.basePath) !== 0;
}

/**
 * Add new item to the navigation history
 * @param path
 */
export function navigate(path: string): void {
  if (isExernalUrl(path)) {
    window.location.assign(currentOptions.baseUrl + path);
    return;
  }
  window.history.pushState(null, null, currentOptions.baseUrl + path);
  open(path);
}

/**
 * Replaces current item in the navigation history
 * @param {string} path
 */
export function replace(path: string): void {
  if (isExernalUrl(path)) {
    window.location.replace(currentOptions.baseUrl + path);
    return;
  }
  window.history.replaceState(null, null, currentOptions.baseUrl + path);
  this.open(path);
}

/**
 * Removes base path
 * @param path
 * @return {string}
 */
export function normalizePath(path: string): string {
  return path.replace(currentOptions.basePath, "");
}

/**
 * Gets current location
 * @return {string}
 */
export function getLocation(): string {
  return (
    window.location.pathname
    .replace(currentOptions.baseUrl, "")
    .replace(/\/$/, "")
  );
}

/**
 * Gets current query
 * @return {object}
 */
export function getQuery(): IQuery {
  const query = window.location.search.substr(1);
  if (!query) {
    return {};
  }

  return (
    query
    .split("&")
    .reduce((params: IQuery, param: string) => {
      const [ key, value ] = param.split("=");
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
      return params;
    }, {})
  );
}

/**
 * Gets current hash
 * @return {string}
 */
export function getHash(): string {
    return window.location.hash.substr(1);
}

/**
 * Get params
 * @param {string} path
 * @return {string}
 */
export function getParams(path: string, location: string): IParams {
  const locationArray: string[] = location.split("/");
  const params: IParams = {};
  path.split("/").forEach((value: string, index: number) => {
    if (value[0] === ":") {
      params[value.substr(1)] = locationArray[index];
    }
  });
  return params;
}

/**
 * Set hash
 * @param {string} hash
 */
export function setHash(hash: string): void {
    window.location.hash = hash;
}

/**
 * Get request object
 * @param {string} path
 * @return {object}
 */
export function getRequest(path: string): IRequest {
  const location = getLocation();
  return {
    location: location,
    hash: getHash(),
    params: getParams(path, location),
    query: getQuery(),
  };
}

/**
 * Open the page by location
 * @param location
 * @return {Promise} A promise that resolves to set destroyer function if any given
 */
export function openCurrentLocation(): Promise<any> {
  const locaton = getLocation();

  const route: IRoute = pathTree.get(locaton);
  if (!route) {
    return Promise.resolve(defaultCallback());
  }

  const request: IRequest = getRequest(route.path);

  const promises: Array<Promise<any>> = [];
  if (route.resolves) {
    route.resolves.forEach((resolve: TResolve) => {
      promises.push(resolve(request));
    });
    return Promise.all(promises).then((results: any[]) => {
      return route.callback(...results);
    }).catch((e) => {
      console.error("Can't open a route", e.message, e.stack);
      return defaultCallback();
    });
  } else {
    return Promise.resolve(route.callback());
  }
}

/**
 * Add router
 * @param {object[]} router
 */
export function addRouter(router: IRoute[]) {
  router.forEach((route: IRoute) => {
    pathTree.add(route.path, route);
  });
}

/**
 * Clear routs
 */
export function clearRoutes() {
  pathTree.clear();
}

/**
 * Set default callback
 * @param {function} callback
 */
export function setDefaultCallback(callback: () => void) {
  defaultCallback = callback;
}
