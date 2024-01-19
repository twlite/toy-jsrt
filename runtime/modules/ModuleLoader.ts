// TODO: fix this
// Currently this file is not written properly, it only exists as a placeholder. I am currently playing around to get simple shit working
// It kind of works but doesnt at the same time

import { JSModuleLoaderAsync } from 'npm:quickjs-emscripten';
import { compileAndParseDependencies } from '../compiler/index.ts';
import { join } from 'https://deno.land/std@0.212.0/path/join.ts';

const ModuleGraph = new Map<string, string>();

enum ModuleProtocols {
  File = 'file:',
  Http = 'http:',
  Https = 'https:',
  Npm = 'npm:',
  GitHub = 'github:',
}

const compileModule = (src: string) => {
  const { transpiled, dependencies } = compileAndParseDependencies(src);

  return { transpiled, dependencies };
};

const green = (str: string) => `\x1b[32m${str}\x1b[0m`;
const blue = (str: string) => `\x1b[34m${str}\x1b[0m`;

const downloadMsg = (p: string) =>
  console.log(`${green('Downloading')} ${blue(p)}`);

async function getModule(_path: string, entry: string) {
  let path = [
    ModuleProtocols.Http,
    ModuleProtocols.Https,
    ModuleProtocols.File,
    ModuleProtocols.Npm,
    ModuleProtocols.GitHub,
  ].some((e) => _path.startsWith(e))
    ? _path
    : join(entry, _path);
  const cached = ModuleGraph.get(path);
  if (cached) return { result: cached };

  try {
    if (
      path.startsWith(ModuleProtocols.Npm) ||
      path.startsWith(ModuleProtocols.GitHub)
    ) {
      path = `https://esm.sh/${
        path.startsWith(ModuleProtocols.GitHub)
          ? path.replace(ModuleProtocols.GitHub, 'gh/')
          : path.replace(ModuleProtocols.Npm, '')
      }?bundle-deps`;
    }

    const url = new URL(path);

    if (
      url.protocol === ModuleProtocols.Http ||
      url.protocol === ModuleProtocols.Https
    ) {
      downloadMsg(path);
      const { transpiled, dependencies } = compileModule(
        await fetch(url, {
          redirect: 'manual',
          method: 'GET',
          headers: {
            'Content-Type': 'application/javascript',
            'User-Agent': 'custom-runtime',
          },
        }).then((r): any => {
          if ([301, 302, 303, 307, 308].includes(r.status)) {
            const newURL = new URL(r.headers.get('location')!);
            return getModule(newURL.href, entry).then((m) => m.result);
          }
          if (!r.ok) throw new Error('Failed to fetch module.');
          return r.text();
        })
      );

      ModuleGraph.set(path, transpiled);

      await Promise.all(
        dependencies
          .filter((e) => e.startsWith('/'))
          .map(async (dep) => {
            const newURL = new URL(url);
            newURL.pathname = dep;
            newURL.search = '?bundle-deps';
            return getModule(newURL.href, entry);
          })
      );

      return { result: transpiled };
    }

    const { transpiled } = compileModule(await Deno.readTextFile(url));
    ModuleGraph.set(path, transpiled);

    return { result: transpiled };
  } catch {
    try {
      const { transpiled } = compileModule(await Deno.readTextFile(path));
      ModuleGraph.set(path, transpiled);
      return { result: transpiled };
    } catch {}
    const error = new Error(`Module ${path} not found.`);
    error.name = 'ModuleNotFoundError';
    error.stack = '';

    return { error, result: '' };
  }
}

export function createModuleLoader(rootEntry: string) {
  return async (moduleName: string): Promise<any> => {
    const { error, result } = await getModule(moduleName, rootEntry);
    if (error) throw error;
    return result;
  };
}
