# WebAssembly Example Snap

This Snap demonstrates how WebAssembly can be used in Snaps.

The Snap passes an input from the user into a compiled version of `assembly/program.ts` which outputs the n-th fibonacci number. The program itself is written in AssemblyScript and compiled to WebAssembly, which can then be loaded in the snap. `scripts/makeWasm.js` outputs a hexadecimal string which can be bundled with the snap.

## Resources

https://www.assemblyscript.org/introduction.html
