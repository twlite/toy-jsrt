import {
  QuickJSContext,
  QuickJSHandle,
  VmCallResult,
} from 'npm:quickjs-emscripten';

export function executeVm(
  fn: () => VmCallResult<QuickJSHandle>,
  vm: QuickJSContext
) {
  const result = fn();

  if (result.error) {
    const err = vm.dump(result.error);
    makeError(err);
    result.error.dispose();
  } else {
    result.value.dispose();
  }
}

function makeError(err: any) {
  try {
    const { name, message, stack } = err;
    if (name === undefined && message === undefined && stack === undefined)
      return console.error(red(err));
    const fmt = `${name}: ${message}\n${stack}`;
    console.error(red(fmt));
  } catch {
    console.error(red(err));
  }
}

const red = (str: string) => `\x1b[31m${str}\x1b[0m`;
