declare global {
  var Runtime: {
    cwd(): string;
    readFile(path: string): string;
    writeFile(path: string, data: string): void;
  };
}

export {};
