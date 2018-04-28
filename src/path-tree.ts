export interface IPathTree<T> {
  [key: string]: T;
}

export class PathTree<T> {
  private tree: IPathTree<T> = {};

  add(path: string, value: T) {
    const unifiedPath = this.removeExtraSlashes(this.unifyPath(path));
    if (this.tree[unifiedPath]) {
      console.warn(`path-router: Warning overwriting key ${unifiedPath} in the path tree`);
    }
    this.tree[unifiedPath] = value;
  }

  get(path: string): T | undefined {
    const normalizedPath = this.removeExtraSlashes(path);
    let value: T;
    // find a simple value
    value = this.tree[normalizedPath];
    if (typeof value !== "undefined") {
      return value;
    }
    let pathArray = normalizedPath.split("/");
    // find a path value
    for (let i = pathArray.length - 1; i >= 0; i--) {
      pathArray[i] = ":";
      value = this.tree[pathArray.join("/")];
      if (typeof value !== "undefined") {
        return value;
      }
    }

    pathArray = normalizedPath.split("/");
    // find a universal value
    for (let i = pathArray.length - 1; i >= 0; i--) {
      pathArray[i] = "*";
      pathArray.splice(i + 1, 1);
      value = this.tree[pathArray.join("/")];
      if (typeof value !== "undefined") {
        return value;
      }
    }
  }

  /**
   * Get path tree
   * @return {object}
   */
  getTree(): IPathTree<T> {
    return this.tree;
  }

  addTree(pathTree: IPathTree<T>) {
    Object.keys(pathTree).forEach((key: string) => {
      this.add(key, pathTree[key]);
    });
  }

  clear() {
    this.tree = {};
  }

  private unifyPath(path: string) {
    return path.replace(/:[a-zA-Z0-9]+/g, ":");
  }

  private removeExtraSlashes(path: string) {
    return path.replace(/\/$/, "").replace(/^\//, "");
  }
}
