; (function (global) {
    "use strict";

    const colors = {
        red: (str) => ("\x1b[31m" + str + "\x1b[0m"),
        yellow: (str) => ("\x1b[33m" + str + "\x1b[0m"),
        green: (str) => ("\x1b[32m" + str + "\x1b[0m"),
        blue: (str) => ("\x1b[34m" + str + "\x1b[0m"),
        magenta: (str) => ("\x1b[35m" + str + "\x1b[0m"),
        cyan: (str) => ("\x1b[36m" + str + "\x1b[0m"),
        white: (str) => ("\x1b[37m" + str + "\x1b[0m"),
        gray: (str) => ("\x1b[90m" + str + "\x1b[0m"),
    };
    const { print, clear } = global.__bootstrap;
    const logger = (level, ...args) => {
        switch (level) {
            case "error":
                print(...args.map((arg) => colors.red(arg)));
                break;
            case "warn":
                print(...args.map((arg) => colors.yellow(arg)));
                break;
            default:
                print(...args.map(inspect));
        }
        print("\n");
    };

    function inspect(obj) {
        if (Array.isArray(obj)) {
            return colors.green(`[${obj.map(inspect).join(", ")}]`);
        }

        if (obj instanceof Error) {
            const { name, message, stack } = obj;

            return colors.red(`${name}: ${message}\n${stack}`);
        }

        if (typeof obj === "number") {
            return colors.yellow(`${obj}`);
        }

        if (typeof obj === "boolean") {
            return colors.blue(`${obj}`);
        }

        if (obj == null) {
            return colors.gray(`${obj}`);
        }

        if (typeof obj === "function") {
            return colors.cyan(`${obj}`);
        }

        if (typeof obj === "object") {
            return colors.magenta(JSON.stringify(obj, null, 2));
        }

        return obj;
    }

    class Console {
        #logger;
        constructor(stdout) {
            if (!stdout) {
                throw new TypeError("Console expects a writable stream");
            }
            this.#logger = stdout;
        }

        log(...args) {
            this.#logger("log", ...args);
        }

        warn(...args) {
            this.#logger("warn", ...args);
        }

        error(...args) {
            this.#logger("error", ...args);
        }

        clear() {
            clear();
        }
    }

    global.console = new Console(logger);
    global.console.Console = Console;

    const rest = [
        "trace",
        "debug",
        "info",
        "dir",
        "dirxml",
        "table",
        "time",
        "timeEnd",
        "group",
        "groupCollapsed",
        "groupEnd",
        "count",
        "assert",
        "profile",
        "profileEnd",
        "timeStamp",
        "context",
        "memory",
    ];

    rest.forEach((method) => {
        global.console[method] = function () {
            global.console.log(...arguments);
        };
    });
})(globalThis);
