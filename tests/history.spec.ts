declare const jsdom: any;

import {
  getHistoryOption,
  setHistoryOptions,
  getLocation,
  getHash,
  setHash,
  getQuery,
  getParams,
  getRequest,
  openCurrentLocation,
  addRouter,
  clearRoutes,
  setDefaultCallback,
  startHistory,
  isHistoryStarted,
  stopHistory
} from "../src/history";

describe("history", () => {
  describe("init", () => {
    it("should set options", () => {
      setHistoryOptions({
        baseUrl: "https://test.com",
      });
      expect(getHistoryOption("baseUrl")).toBe("https://test.com");
    });
  });

  describe("getLocation", () => {
    it("should return location without basename", () => {
      setHistoryOptions({
        baseUrl: "https://test.com/",
      });
      jsdom.reconfigure({
        url: "https://test.com/something"
      });
      expect(getLocation()).toBe("/something");
    });
  });

  describe("getHash", () => {
    it("should return hash", () => {
      jsdom.reconfigure({
        url: "https://test.com/#something"
      });
      setHash("#something");
      expect(getHash()).toBe("something");
    });
  });

  describe("getQuery", () => {
    it("should return query", () => {
      jsdom.reconfigure({
        url: "https://test.com/?key1=value1&key2=value2"
      });
      expect(getQuery()).toEqual({
        key1: "value1",
        key2: "value2",
      });
    });
  });

  describe("getParams", () => {
    it("should return params", () => {
      expect(getParams("/something/:key1/:key2", "/something/value1/value2")).toEqual({
        key1: "value1",
        key2: "value2",
      });
    });
  });

  describe("getRequest", () => {
    it("should return params", () => {
      jsdom.reconfigure({
        url: "https://test.com/something/val1/val2/?key1=value1&key2=value2#hash",
      });
      expect(getRequest("/something/:key1/:key2")).toEqual({
        location: "/something/val1/val2",
        hash: "hash",
        params: {
          key1: "val1",
          key2: "val2",
        },
        query: {
          key1: "value1",
          key2: "value2",
        },
      });
    });
  });

  describe("openCurrentLocation", () => {
    it("should call current location callback", () => {
      jsdom.reconfigure({
        url: "https://test.com/something/val1/val2",
      });
      const spy = jest.fn();
      addRouter([{
        path: "something/:key1/:key2",
        callback: spy
      }]);
      openCurrentLocation();
      expect(spy).toHaveBeenCalled();
      clearRoutes();
    });

    it("should call current location callback when resolves are resolved", async () => {
      jsdom.reconfigure({
        url: "https://test.com/something/val1/val2",
      });
      const spy = jest.fn();
      addRouter([{
        path: "something/:key1/:key2",
        resolves: [() => true, () => 123],
        callback: spy
      }]);
      await openCurrentLocation();
      expect(spy).toHaveBeenCalledWith(true, 123);
      clearRoutes();
    });

    it("should call default callback when one of resolves is rejected", async () => {
      jsdom.reconfigure({
        url: "https://test.com/something/val1/val2",
      });
      const spy = jest.fn();
      const spyError = jest.spyOn(console, "error").mockImplementation(() => {});
      setDefaultCallback(spy);
      addRouter([{
        path: "something/:key1/:key2",
        resolves: [() => true, () => Promise.reject(new Error())],
        callback: () => {}
      }]);
      await openCurrentLocation();
      expect(spy).toHaveBeenCalled();
      expect(spyError).toHaveBeenCalled();
      clearRoutes();
    });

    it("should call default callback when route is not found", async () => {
      const spy = jest.fn();
      setDefaultCallback(spy);
      await openCurrentLocation();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('startHistory', () => {
    it('should start history', () => {
      startHistory();
      expect(isHistoryStarted()).toBe(true);
      stopHistory();
    });
  });
});
