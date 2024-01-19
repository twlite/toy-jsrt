export class Database<K, V> extends Map<K, V> {
  public constructor(public readonly path: string) {
    super();

    try {
      this.#read();
    } catch {
      //
    }
  }

  public set(key: K, value: V): this {
    super.set(key, value);
    this.#write();
    return this;
  }

  public delete(key: K): boolean {
    const result = super.delete(key);
    this.#write();
    return result;
  }

  public clear(): void {
    super.clear();
    this.#write();
  }

  #write() {
    const serialized = JSON.stringify([...this.entries()]);
    Runtime.writeFile(this.path, serialized);
  }

  #read() {
    const data = Runtime.readFile(this.path);
    const parsed = JSON.parse(data);

    for (const [key, value] of parsed) {
      super.set(key, value);
    }
  }
}
