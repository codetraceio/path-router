export interface IPathTree<T> {
  [key: string]: IPathNode<T>;
}

export interface IPathNode<T> {
  key?: string;
  value?: T;
  children?: IPathTree<T>;
  leaf?: boolean;
  parent?: IPathTree<T>;
}

export class PathTree<T> {
  private tree: IPathTree<T> = {};
  private nodeParent: IPathTree<T> = null;

  add(path: string, value: T) {
    const noSlashPath = this.removeExtraSlashes(path);
    const pathArray = noSlashPath.split("/");
    const pathArrLength = pathArray.length;
    let currentTree: IPathTree<T> = this.tree;

    for (let i = 0; i < pathArrLength; i++) {
      // checking params
      const key = pathArray[i][0] === ":" ? ":" : pathArray[i];

      if (key in currentTree) {
        if (i === pathArrLength - 1) {
          console.warn(`path-router: Warning duplicate key ${noSlashPath} in the path tree`);
        }
      } else {
        currentTree[key] = this.createNode(pathArray[i], pathArrLength - 1, i, value);
        this.nodeParent = currentTree;

        // last item of adding path must be a leaf
        if (i === pathArrLength - 1) {
          currentTree[key].leaf = true;
        }
      }
      currentTree = currentTree[key].children;
    }
  }

  get(path: string): T {
    const normalizedPath = this.removeExtraSlashes(path);
    const pathArray = normalizedPath.split("/");
    const pathArrLength = pathArray.length;
    let value: T;
    let currentTree = this.tree;

    for (let i = 0; i < pathArrLength; i++) {
      if (pathArray[i] in currentTree) {
        if ((i === pathArrLength - 1) && currentTree[pathArray[i]].leaf) {
          value = currentTree[pathArray[i]].value;
          return value;
        }
        currentTree = currentTree[pathArray[i]].children;
      } else if (":" in currentTree) {
        if ((i === pathArrLength - 1) && currentTree[":"].leaf) {
          value = currentTree[":"].value;
          return value;
        }
        currentTree = currentTree[":"].children;
      }
    }

    for (let i = pathArrLength - 1; i >= 0; i--) {
      if ("*" in currentTree) {
        return currentTree["*"].value;
      } else if (currentTree[pathArray[i]]) {
        currentTree = currentTree[pathArray[i]].parent;
      } else if (currentTree[":"]) {
        currentTree = currentTree[":"].parent;
      }
    }
  }

  clear() {
    this.tree = {};
    this.nodeParent = null;
  }

  private createNode(val, lastIndex, index, value): IPathNode<T> {
    const keyCheck = val.substring(0, 1);

    return {
      key: keyCheck === ":" ? val.substring(1, val.length) : val,
      value: index === lastIndex ? value : null,
      children: {},
      leaf: index === lastIndex,
      parent: this.nodeParent,
    };
  }

  private removeExtraSlashes(path: string) {
    return path.replace(/\/$/, "").replace(/^\//, "");
  }
}
