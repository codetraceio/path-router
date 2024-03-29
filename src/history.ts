import { PathTree } from "./path-tree";

export interface HitoryOptions {
  baseUrl: string;
  basePath: string;
  [key: string]: string;
}

export interface Request {
  location: string;
  params: Params;
  query: Query;
  hash: string;
}

export type Resolve = (request: Request) => Promise<any> | any;

export interface Route {
  path: string;
  resolves?: Resolve[];
  loadingCallback?: () => void;
  callback: (request: Request, ...params: any[]) => any;
}

export interface Params {
  [key: string]: string;
}

export interface Query {
  [key: string]: string;
}

const defaultOptions: HitoryOptions = {
  baseUrl: "/",
  basePath: "",
};
const pathTree: PathTree<Route> = new PathTree<Route>();

let currentOptions: HitoryOptions = {
  ...defaultOptions,
};
let started: boolean = false;
let listener: any = null;
let navigationCalled: boolean = false;
let defaultCallback: () => void = () => {};

/**
 * Set history options
 * @param options
 */
export function setHistoryOptions(options: Partial<HitoryOptions>): void {
  currentOptions = {...defaultOptions, ...options} as HitoryOptions;
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

/**
 * Check is path extenal
 * @param {string} path
 * @return {boolean}
 */
export function isLocationExternal(location: string): boolean {
  return !!currentOptions.basePath && location.indexOf(currentOptions.basePath) !== 0;
}

/**
 * Add new item to the navigation history
 * @param path
 */
export function navigate(path: string): void {
  if (isLocationExternal(path)) {
    window.location.assign(currentOptions.baseUrl + path);
    return;
  }
  navigationCalled = true;
  window.history.pushState(null, "", currentOptions.baseUrl + path);
  openCurrentLocation();
}

/**
 * Replaces current item in the navigation history
 * @param {string} path
 */
export function replace(path: string): void {
  if (isLocationExternal(path)) {
    window.location.replace(currentOptions.baseUrl + path);
    return;
  }
  window.history.replaceState(null, "", currentOptions.baseUrl + path);
  openCurrentLocation();
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
export function getQuery(): Query {
  const query = window.location.search.substr(1);
  if (!query) {
    return {};
  }

  return (
    query
    .split("&")
    .reduce((params: Query, param: string) => {
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
export function getParams(path: string, location: string): Params {
  const locationArray: string[] = location.split("/");
  const params: Params = {};
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
export function getRequest(path: string): Request {
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

  const route: Route | undefined = pathTree.get(locaton);
  if (typeof route !== "object") {
    return Promise.resolve(defaultCallback());
  }

  const request: Request = getRequest(route.path);

  const promises: Array<Promise<any>> = [];
  if (route.resolves) {
    route.resolves.forEach((resolve: Resolve) => {
      promises.push(resolve(request));
    });
    if (typeof route.loadingCallback === "function") {
      route.loadingCallback();
    }
    return Promise.all(promises).then((results: any[]) => {
      return route.callback(request, ...results);
    }).catch((e) => {
      console.error("Can't open a route", e.message, e.stack);
      return defaultCallback();
    });
  } else {
    return Promise.resolve(route && route.callback(request));
  }
}

/**
 * Add router
 * @param {object[]} router
 */
export function addRouter(router: Route[]) {
  router.forEach((route: Route) => {
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

/**
 * Is navigate called
 * @return {boolean} returns true if navigate is called at least once
 */
export function isNavigateCalled(): boolean {
  return navigationCalled;
}
