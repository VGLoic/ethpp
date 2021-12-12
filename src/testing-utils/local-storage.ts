export class MockLocalStorage {
  public store = {} as Record<string, string>;

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  reset() {
    this.store = {};
  }
}
