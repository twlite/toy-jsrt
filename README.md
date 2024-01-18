# toy-jsrt

A toy/meme JavaScript runtime built with quickjs and Deno.

> **WARNING**: This project is still in development and it is not even close to be usable. For now it can just prompt for input and print it back.

# Why?

- **Anything that can be written in JavaScript will eventually be written in JavaScript.**
- I wanted to learn more about JavaScript runtimes without touching native code.
- I wanted to find a reason to use Deno.
- I wanted to try out quickjs.
- This is just a toy project, I don't expect it to be useful anyway.

# How?

This project uses [quickjs-emscripten](https://www.npmjs.com/package/quickjs-emscripten) JavaScript engine to execute JavaScript code. Native features are implemented with the help of [Deno](https://deno.land).

The executable is produced using `deno compile` command.
