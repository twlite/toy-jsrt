import { QuickJSAsyncContext } from "npm:quickjs-emscripten";
import { executeVm } from "../execute.ts";
import * as path from "https://deno.land/std@0.212.0/path/mod.ts";

function setupPreExecution(vm: QuickJSAsyncContext) {
  using bootstrap = vm.newObject();
  using runtime = vm.newObject();
  using printFn = vm.newFunction("print", (...args) => {
    const res = args.map((m) => {
      const val = vm.dump(m);
      m.dispose();

      return val;
    });

    const data = new TextEncoder().encode(res.join(" "));
    Deno.stdout.writeSync(data);
  });

  using clearFn = vm.newFunction("clear", () => {
    console.clear();
    return vm.undefined;
  });

  using readFile = vm.newFunction("readFile", (path) => {
    const m = vm.dump(path);
    path.dispose();

    const data = Deno.readTextFileSync(m);
    return vm.newString(data);
  });

  using writeFile = vm.newFunction("writeFile", (path, data) => {
    const m = vm.dump(path);
    path.dispose();

    const d = vm.dump(data);
    data.dispose();
    Deno.writeTextFileSync(m, d);
    return vm.undefined;
  });

  using cwd = vm.newFunction("cwd", () => {
      const data = Deno.cwd();
      return vm.newString(data);
  });

  vm.setProp(bootstrap, "print", printFn);
  vm.setProp(bootstrap, "clear", clearFn);
  vm.setProp(runtime, "readFile", readFile);
  vm.setProp(runtime, "writeFile", writeFile);
  vm.setProp(runtime, "cwd", cwd);

  using promptFn = vm.newFunction("prompt", (...args) => {
    const [m, def] = args.map((m) => {
      const res = vm.dump(m);
      m.dispose();

      return res;
    });

    const data = prompt(m, def);

    if (typeof data === "string") return vm.newString(data);
    return vm.null;
  });

  
  using alertFn = vm.newFunction("alert", (msg) => {
    const m = vm.dump(msg);
    msg.dispose();
    
    alert(m);
    
    return vm.undefined;
  });
  
  
  using confirmFn = vm.newFunction("confirm", (msg) => {
    const m = vm.dump(msg);
    msg.dispose();
    
    const data = confirm(m);
    return data ? vm.true : vm.false;
  });
  
  vm.setProp(vm.global, "alert", alertFn);
  vm.setProp(vm.global, "prompt", promptFn);
  vm.setProp(vm.global, "alert", confirmFn);
  vm.setProp(vm.global, "__bootstrap", bootstrap);
  vm.setProp(vm.global, "Runtime", runtime);
}

export async function initializeStdModules(ctx: QuickJSAsyncContext) {
  setupPreExecution(ctx);
  const dirname = path.dirname(path.fromFileUrl(import.meta.url));
  const stdMods = path.join(dirname, 'js');
  const files = [];

  for await (const entry of Deno.readDir(stdMods)) {
    files.push(entry.name);
  }

  await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(stdMods, file);
      const mod = ({
        name: file,
        path: fullPath,
        module: await Deno.readTextFile(fullPath),
      });

      await executeVm(
        () =>
          ctx.evalCodeAsync(mod.module, mod.name, {
            backtraceBarrier: true,
            type: 'module'
          }),
        ctx,
      );
    }),
  );

  // clear bootstrap object
  await executeVm(() => ctx.evalCodeAsync(';delete globalThis["__bootstrap"];'), ctx);
}
