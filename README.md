# toy-jsrt

A toy/meme JavaScript runtime built with quickjs and Deno.

> **WARNING**: This project is still in development and it is not even close to be usable.

# Why?

- **Anything that can be written in JavaScript will eventually be written in JavaScript.**
- I wanted to learn more about JavaScript runtimes without touching native code.
- I wanted to find a reason to use Deno.
- I wanted to try out quickjs.
- This is just a toy project, I don't expect it to be useful anyway.

# Current features

- Can read/write files.
- Can execute JavaScript and TypeScript (wont type check) code.
- Can kinda import or execute from another file and url
- console.log/prompt/alert/confirm is available.

# How?

This project uses [quickjs-emscripten](https://www.npmjs.com/package/quickjs-emscripten) JavaScript engine to execute JavaScript code. Native features are implemented with the help of [Deno](https://deno.land).

The executable is produced using `deno compile` command.

# Examples

See [examples](./examples) directory.

# Building locally

You need to have [Deno](https://deno.land) installed. Then run:

```sh
deno task build
```

It produces an executable in `./build` directory.
