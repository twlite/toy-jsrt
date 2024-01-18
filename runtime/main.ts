import { getQuickJS } from 'npm:quickjs-emscripten';
import { bootstrap } from './bootstrap.ts';
import { executeVm } from './execute.ts';

// @ts-ignore polyfill
Symbol.dispose ??= Symbol('[Symbol.dispose]');
// @ts-ignore polyfill
Symbol.asyncDispose ??= Symbol('[Symbol.asyncDispose]');

async function main() {
    const path = Deno.args[0];
    if (!path) {
        console.log('No input file specified.');
        Deno.exit(1);
    }

    const code = await Deno.readTextFile(path);
    const QuickJS = await getQuickJS();
    using vm = QuickJS.newContext();
    
    // setup
    await bootstrap(vm);

    // execute
    executeVm(() => vm.evalCode(code, path), vm);
}

main();
