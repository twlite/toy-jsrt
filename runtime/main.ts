import { newQuickJSAsyncWASMModule } from "npm:quickjs-emscripten";
import { bootstrap } from "./bootstrap.ts";
import { executeVm } from "./execute.ts";
import { createModuleLoader } from "./modules/ModuleLoader.ts";
import { dirname, resolve } from "https://deno.land/std@0.212.0/path/mod.ts";
import { compileAndParseDependencies } from "./compiler/index.ts";

// @ts-ignore polyfill
Symbol.dispose ??= Symbol("[Symbol.dispose]");
// @ts-ignore polyfill
Symbol.asyncDispose ??= Symbol("[Symbol.asyncDispose]");

async function main(args: Record<string, string>) {
  const { _: path } = args;
  if (!path) {
    console.log("No input file specified.");
    Deno.exit(1);
  }

  const code = await Deno.readTextFile(path);

  const module = await newQuickJSAsyncWASMModule();
  const moduleLoader = createModuleLoader(dirname(path));
  using runtime = module.newRuntime({ moduleLoader });
  
  using context = runtime.newContext();

  // setup
  await bootstrap(context);

  // execute  
  await executeVm(() => context.evalCodeAsync(compileAndParseDependencies(code).transpiled, resolve(Deno.cwd(), path), {
    backtraceBarrier: false,
    type: 'module'
  }), context);
}

main(parseArgs(Deno.args));

function parseArgs(args: string[]) {
  const result: Record<string, string> = {};

  let currentKey: string | null = null;

  for (const arg of args) {
    if (arg.startsWith("--")) {
      if (currentKey) {
        result[currentKey] = "true";
      }
      currentKey = arg.slice(2);
    } else if (arg.startsWith("-")) {
      if (currentKey) {
        result[currentKey] = "true";
      }
      currentKey = arg.slice(1);
    } else if (currentKey) {
      result[currentKey] = arg;
      currentKey = null;
    } else {
      result._ = arg;
    }
  }

  if (currentKey) {
    result[currentKey] = "true";
  }

  return result;
}
