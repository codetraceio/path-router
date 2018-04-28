import { PathTree } from "../src/path-tree";

describe('PathTree', () => {
  it('should find a path', () => {
    const tree = new PathTree<string>();
    tree.add("/something/else", "value");
    expect(tree.get("/something/else")).toBe("value");
  });

  it('should find a path with params', () => {
    const tree = new PathTree<string>();
    tree.add("/something/:else/:or/:other", "value1");
    tree.add("/something/:else", "value2");
    expect(tree.get("/something/1/2/3")).toBe("value1");
  });

  it('should find a universal path', () => {
    const tree = new PathTree<string>();
    tree.add("/something/:else/:or/:other", "value1");
    tree.add("/something/*", "value2");
    expect(tree.get("/something/1/2")).toBe("value2");
  });

  it('should get tree', () => {
    const tree = new PathTree<string>();
    tree.add("/something/1", "value1");
    tree.add("/something/2", "value2");
    expect(tree.getTree()).toEqual({
      "something/1": "value1",
      "something/2": "value2",
    });
  });

  it('should add tree', () => {
    const tree = new PathTree<string>();
    tree.addTree({
      "something/1": "value1",
      "something/2": "value2",
    });
    expect(tree.get("/something/2")).toBe("value2");
  });

  it('should warn when overwriting a tree key', () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const tree = new PathTree<string>();
    tree.add("something/1", "value1");
    tree.add("something/1", "value2");
    expect(spy).toHaveBeenCalled();
    spy.mockClear();
  });

  it('should clear path tree', () => {
    const tree = new PathTree<string>();
    tree.add("something/1", "value1");
    tree.clear();
    expect(tree.get("/something/1")).toBe(undefined);
  });
});
