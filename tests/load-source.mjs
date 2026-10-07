import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { runInThisContext } from 'node:vm';
import ts from 'typescript';

const nativeRequire = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Compile source in memory so Node tests exercise the actual Next.js TypeScript
// modules, including path aliases, without creating generated files in src/.
export function loadSource(path, mocks = {}) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const compiledModule = { exports: {} };
    cache.set(filename, compiledModule);
    const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    const resolveImport = specifier => {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      if (specifier.startsWith('.') || specifier.startsWith('@/')) {
        const base = specifier.startsWith('@/') ? resolve(root, 'src', specifier.slice(2)) : resolve(dirname(filename), specifier);
        const target = [base, `${base}.ts`, `${base}.tsx`].find(existsSync);
        if (target) return load(target);
      }
      return nativeRequire(specifier);
    };
    runInThisContext(`(function(require,module,exports){${source}\n})`, { filename })(resolveImport, compiledModule, compiledModule.exports);
    return compiledModule.exports;
  }
  return load(resolve(root, path));
}
