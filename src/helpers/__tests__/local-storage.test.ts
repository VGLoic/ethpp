import { LOCAL_STORAGE_KEY, LocalStorageHelper } from "../";
import { MockLocalStorage } from "../../testing-utils";

describe("LocalStorageHelper exceptions", () => {
  let localStorage: any;
  const mockLocalStorage = new MockLocalStorage();
  beforeAll(() => {
    localStorage = global.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
    });
  });

  afterEach(() => {
    mockLocalStorage.reset();
  });

  afterAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorage,
    });
  });

  describe("getKeys", () => {
    test("it should remove the item if the parsing fails", () => {
      mockLocalStorage.setItem(LOCAL_STORAGE_KEY, "bla");
      const keys = LocalStorageHelper.getKeys();
      expect(keys).toEqual([]);
      expect(mockLocalStorage.getItem(LOCAL_STORAGE_KEY)).toEqual(null);
    });
    test("it should remove the item if retrieved item is not an array", () => {
      mockLocalStorage.setItem(LOCAL_STORAGE_KEY, '{"bla": 4}');
      const keys = LocalStorageHelper.getKeys();
      expect(keys).toEqual([]);
      expect(mockLocalStorage.getItem(LOCAL_STORAGE_KEY)).toEqual(null);
    });
    test("it should remove the item if retrieved item is an array with non string item", () => {
      mockLocalStorage.setItem(LOCAL_STORAGE_KEY, "[4]");
      const keys = LocalStorageHelper.getKeys();
      expect(keys).toEqual([]);
      expect(mockLocalStorage.getItem(LOCAL_STORAGE_KEY)).toEqual(null);
    });
  });
});
