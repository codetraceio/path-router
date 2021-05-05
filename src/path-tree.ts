export interface PathNode<T> {
  key?: string;
  value?: T;
  children?: {[key: string]: PathNode<T>};
  leaf?: boolean;
  parentNode?: PathNode<T>;
}

/**
 * PathTree - represents a path as a tree structure
 */
export class PathTree<T> {
  private rootNode: PathNode<T> = {
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
    let currentNode: PathNode<T> = this.rootNode;

    for (let i = 0; i < pathArrLength; i++) {
      // check params
      const key = pathArray[i][0] === ":" ? ":" : pathArray[i];

      if (key in currentNode.children) {
        if (i === pathArrLength - 1 && currentNode.children[key].leaf) {
          console.warn(`path-router: Warning duplicate key ${noSlashPath} in the path tree`);
        }
      } else {
        const newNode = this.createNode(pathArray[i], pathArrLength - 1, i, value, currentNode);
        currentNode.children[key] = newNode;
      }
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
        currentNode = currentTree[pathArray[i]];
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
      children: {},
    };
  }

  /**
   * Print tree
   */
  print() {
    this.printInternal(this.rootNode, "");
  }

  private printInternal(node: PathNode<T>, prefix: string) {
    Object.values(node.children).forEach((child) => {
      console.log(prefix, child.key, child.leaf ? "leaf" : "", child.parentNode ? "has parent" : "");
      this.printInternal(child, `  ${prefix}`);
    });
  }

  private createNode(key: string, lastIndex: number, index: number, value: T, parentNode: PathNode<T>): PathNode<T> {
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
