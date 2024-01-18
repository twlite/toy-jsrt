; (function (global) {
    'use strict';

    if (typeof global.console === 'undefined') {
        const colors = {
            error: (str) => ('\x1b[31m' + str + '\x1b[0m'),
            warn: (str) => ('\x1b[33m' + str + '\x1b[0m'),
        }
        const print = global.print;
        const clear = global.clear;
        const logger = (level, ...args) => {
            switch (level) {
                case 'error':
                    print(...args.map(arg => colors.error(arg)));
                    break;
                case 'warn':
                    print(...args.map(arg => colors.warn(arg)));
                    break;
                default:
                    print(...args);
            }
            print('\n');
        };

        class Console {
            #logger;
            constructor(stdout) {
                if (!stdout) {
                    throw new TypeError('Console expects a writable stream');
                }
                this.#logger = stdout;
            }

            log(...args) {
                this.#logger('log', ...args);
            }

            warn(...args) {
                this.#logger('warn', ...args);
            }

            error(...args) {
                this.#logger('error', ...args);
            }

            clear() {
                clear();
            }
        }

        global.console = new Console(logger);
        global.console.Console = Console;

        const rest = [
            'trace',
            'debug',
            'info',
            'dir',
            'dirxml',
        ];

        rest.forEach((method) => {
            global.console[method] = function () {
                global.console.log(...arguments);
            };
        });

        delete global['print'];
        delete global['clear'];
    }
})(globalThis);