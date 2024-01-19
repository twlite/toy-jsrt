import { QuickJSAsyncContext } from 'npm:quickjs-emscripten';
import { initializeStdModules } from './modules/initializeStd.ts';

export async function bootstrap(vm: QuickJSAsyncContext) {
  await initializeStdModules(vm);
}
