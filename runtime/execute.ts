import {
  QuickJSContext,
  QuickJSHandle,
  VmCallResult,
} from 'npm:quickjs-emscripten';

export async function executeVm(
  fn: () => Promise<VmCallResult<QuickJSHandle>>,
  vm: QuickJSContext
) {
  const result = await fn();

  if (result.error) {
    const err = vm.dump(result.error);
    makeError(err);
    result.error.dispose();
  } else {
    const val = vm.dump(result.value);
    result.value.dispose();
    return val;
  }
}

function makeError(err: any) {
  if (err === '') {
    return console.error(red('[FATAL] Unknown error'));
  }

  try {
    const { name, message, stack } = err;
    if (name === undefined && message === undefined && stack === undefined) {
      return console.error(red(err));
    }
    const fmt = `${name}: ${message}\n${stack}`;
    console.error(red(fmt));
  } catch {
    console.error(red(err));
  }
}

const red = (str: string) => `\x1b[31m${str}\x1b[0m`;
