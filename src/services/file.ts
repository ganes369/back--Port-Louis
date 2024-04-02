import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface IReadFile<T> {
  read(): Promise<T[]>;
  write(obg: T, source: string): Promise<void>;
}

class ReadFile<T> implements IReadFile<T> {
  private file?: string;
  constructor(file?: string) {
    this.file = file;
  }

  async read(): Promise<T[]> {
    if (!this.file) return [];
    const dir = await readdir(path.resolve(__dirname, this.file));
    const array: any[] = [];
    for (const item of dir) {
      const file = await readFile(
        path.resolve(__dirname, `${this.file}/${item}`)
      );
      const objects = file
        .toString()
        .trim()
        .split("\r\n")
        .map((item: string) => {
          return JSON.parse(item);
        });
      const objectsWithKey = objects.map((obj) => {
        if ("id_pedido" in obj)
          return {
            ...obj,
            key: item.replace(/.txt/, ""),
            id_pedido: `P${obj.id_pedido}`,
          };
        return { ...obj, key: item.replace(/.txt/, "") };
      });
      array.push(objectsWithKey);
    }
    return array.flatMap((item) => item.map((obj: any) => obj));
  }

  async write(obj: T, source: string): Promise<void> {
    await writeFile(
      path.resolve(__dirname, `${source}`),
      JSON.stringify(obj, null, 2)
    );
  }
}

export default ReadFile;
