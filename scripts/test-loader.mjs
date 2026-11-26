/**
 * Node.js ESM test loader for Hermit test scripts.
 * Resolves TypeScript path aliases (@/) and extensionless .ts imports
 * so that `node --import ./scripts/test-loader.mjs --test scripts/test-*.cjs` works.
 *
 * Usage is handled automatically via the `test` npm script.
 */
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const tsExtensions = ['.ts', '.mts'];

export async function resolve(specifier, context, nextResolve) {
  // 1. Resolve @/ path alias to <rootDir>/src/
  if (specifier.startsWith('@/')) {
    const resolved = path.join(rootDir, 'src', specifier.slice(2));
    for (const ext of tsExtensions) {
      try {
        return await nextResolve(pathToFileURL(resolved + ext).href, context);
      } catch {
        // Try next extension
      }
    }
    return nextResolve(pathToFileURL(resolved).href, context);
  }

  // 2. Try the specifier as-is first
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    // 3. If a relative import without extension fails, try appending .ts
    if (err.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.')) {
      for (const ext of tsExtensions) {
        try {
          return await nextResolve(specifier + ext, context);
        } catch {
          // Try next extension
        }
      }
    }
    throw err;
  }
}
