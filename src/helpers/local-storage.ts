export const LOCAL_STORAGE_KEY = "eth-provider-gatherer_keys";

export class LocalStorageHelper {
  static getKeys(): string[] {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!item) return [];
    try {
      const providerKeys = JSON.parse(item);
      if (
        !Array.isArray(providerKeys) ||
        providerKeys.some((e) => typeof e !== "string")
      ) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return [];
      }
      return providerKeys;
    } catch (err) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return [];
    }
  }

  static addKey(key: string) {
    const keySet = new Set(this.getKeys());
    keySet.add(key);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(keySet)));
  }

  static removeKey(key: string) {
    const keySet = new Set(this.getKeys());
    keySet.delete(key);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(keySet)));
  }
}
