import { createHash } from 'crypto';
import type { Stats } from 'fs';
import { pathExists, readFile, writeFile } from 'fs-extra';
import { join } from 'path';

interface CacheEntry {
  inputHash: string;
  inputMtime: number;
}

interface CacheData {
  [outputPath: string]: CacheEntry;
}

const CACHE_FILE = '.mitosis-cache.json';

export class BuildCache {
  private cache: CacheData = {};
  private cacheDir: string;

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir;
  }

  async load() {
    const cachePath = join(this.cacheDir, CACHE_FILE);
    if (await pathExists(cachePath)) {
      const data = await readFile(cachePath, 'utf8');
      this.cache = JSON.parse(data);
    }
  }

  async save() {
    const cachePath = join(this.cacheDir, CACHE_FILE);
    await writeFile(cachePath, JSON.stringify(this.cache, null, 2));
  }

  shouldProcessWithStats(inputPath: string, inputStats: Stats): boolean {
    const cached = this.cache[inputPath];
    if (!cached) return true;

    const inputHash = createHash('md5')
      .update(inputStats.mtimeMs.toString() + inputStats.size)
      .digest('hex');
    return cached.inputHash !== inputHash || cached.inputMtime !== inputStats.mtimeMs;
  }

  updateCacheWithStats(inputPath: string, inputStats: Stats) {
    const inputHash = createHash('md5')
      .update(inputStats.mtimeMs.toString() + inputStats.size)
      .digest('hex');
    this.cache[inputPath] = { inputHash, inputMtime: inputStats.mtimeMs };
  }

  remove(inputPath: string) {
    delete this.cache[inputPath];
  }
}
