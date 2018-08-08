export interface IPathNode<T> {
  key?: string;
  value?: T;
  children?: {[key: string]: IPathNode<T>};
  leaf?: boolean;
  parentNode?: IPathNode<T>;
}

/**
 * PathTree - represents a path as a tree structure
 */
export class PathTree<T> {
  private rootNode: IPathNode<T> = {
    children: {},
  };

  /**
   * Adds a path
   * @param {string} path
   * @param {object} value 
   */
  add(path: string, value: T) {
    const noSlashPath = this.removeExtraSlashes(path);
    const pathArray = noSlashPath.split("/");
    const pathArrLength = pathArray.length;
    let currentNode: IPathNode<T> = this.rootNode;
    let parentNode: IPathNode<T> = null;
    

    for (let i = 0; i < pathArrLength; i++) {
      // check params
      const key = pathArray[i][0] === ":" ? ":" : pathArray[i];

      if (key in currentNode.children) {
        if (i === pathArrLength - 1 && currentNode.children[key].leaf) {
          console.warn(`path-router: Warning duplicate key ${noSlashPath} in the path tree`);
        }
      } else {
        const newNode = this.createNode(pathArray[i], pathArrLength - 1, i, value, parentNode);
        currentNode.children[key] = newNode;
      }
      parentNode = currentNode;
      currentNode = currentNode.children[key];
    }
  }

  /**
   * Gets a value by path
   * @param {string} path
   * @return {object} 
   */
  get(path: string): T {
    const normalizedPath = this.removeExtraSlashes(path);
    const pathArray = normalizedPath.split("/");
    const pathArrLength = pathArray.length;
    let value: T;
    let currentNode = this.rootNode;
    let currentTree = currentNode.children;

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
        currentNode = currentTree[":"];
        if (!currentNode) {
          break;
        }
        currentTree = currentNode.children;
      }
    }

    for (let i = pathArrLength - 1; i >= 0; i--) {
      if ("*" in currentTree) {
        return currentTree["*"].value;
      } else {
        currentNode = currentNode.parentNode;
        if (!currentNode) {
          break;
        }
        currentTree = currentNode && currentNode.children;
      }
    }
  }

  /**
   * Clears all existings pathes
   */
  clear() {
    this.rootNode = {
      children:{},
    };
  }

  private createNode(key: string, lastIndex: number, index: number, value: T, parentNode: IPathNode<T>): IPathNode<T> {
    return {
      key: key[0] === ":" ? key.substring(1, key.length) : key,
      value: index === lastIndex ? value : null,
      children: {},
      leaf: index === lastIndex,
      parentNode: parentNode,
    };
  }

  private removeExtraSlashes(path: string) {
    return path.replace(/\/$/, "").replace(/^\//, "");
  }
}
