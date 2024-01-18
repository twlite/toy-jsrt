import { QuickJSContext } from "npm:quickjs-emscripten";
import { executeVm } from "./execute.ts";

export async function bootstrap(vm: QuickJSContext) {
    using printFn = vm.newFunction('print', (...args) => {
        const res = args.map(m => {
            const res = vm.dump(m);
            m.dispose();

            return res;
        });

        const data = new TextEncoder().encode(res.join(' '));
        Deno.stdout.writeSync(data);
    });
    
    vm.setProp(vm.global, 'print', printFn);

    using clearFn = vm.newFunction('clear', () => {
        console.clear();
        return vm.undefined;
    });

    vm.setProp(vm.global, 'clear', clearFn);

    using promptFn = vm.newFunction('prompt', (...args) => {
        const [m, def] = args.map(m => {
            const res = vm.dump(m);
            m.dispose();

            return res;
        });

        const data = prompt(m, def);

        if (typeof data === 'string') return vm.newString(data);
        return vm.null;
    });

    vm.setProp(vm.global, 'prompt', promptFn);

    using alertFn = vm.newFunction('alert', (msg) => {
        const m = vm.dump(msg);
        msg.dispose();

        alert(m);

        return vm.undefined;
    });

    vm.setProp(vm.global, 'alert', alertFn);

    using confirmFn = vm.newFunction('confirm', (msg) => {
        const m = vm.dump(msg);
        msg.dispose();

        const data = confirm(m);
        return data ? vm.true : vm.false;
    });

    vm.setProp(vm.global, 'alert', confirmFn);

    const src = import.meta.resolve('./js').replace(/file:\/\/\/?/, '');
    const scripts = await Deno.readDir(src);
    
    for await (const file of scripts) {
        const code = await Deno.readTextFile(`${src}/${file.name}`);
        executeVm(() => vm.evalCode(code, file.name), vm);
    }
}