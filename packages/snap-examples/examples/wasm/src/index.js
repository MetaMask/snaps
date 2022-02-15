const { ethErrors } = require('eth-rpc-errors');

// Ref:
// - https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API
// - https://github.com/mdn/webassembly-examples/tree/06556204f687c00a5d9d3ab55805204cbb711d0c/js-api-examples

// NOTE: I couldn't get fetching to work locally due to CORS issues
// const WASM_SOURCE_URL = 'http://localhost:8082/program.wasm';

// const importObject = {
//   imports: { imported_func: (arg) => console.log(arg) }
// };

let wasm;

// const initializeWasm = async () => {
//   try {
//     const response = await fetch(WASM_SOURCE_URL, {
//       cache: 'no-cache',
//       mode: 'no-cors',
//       // headers: {
//       //   'Content-Type': 'application/wasm'
//       // }
//     })

//     if (response.status !== 200) {
//       const message = `HTTP error: ${response.status}: ${response.statusText}`;
//       console.error(message);
//       throw message;
//     }

//     wasm = await WebAssembly.instantiateStreaming(
//       response,
//       // importObject,
//     );
//   } catch (error) {
//     console.error('Failed to initialize WebAssembly module.', error);
//     throw error;
//   }
// }

// See scripts/makeWasm.js for how this was created.
const PROGRAM_WASM_HEX =
  '0061736d01000000018580808000016000017f0382808080000100048480808000017000000583808080000100010681808080000007918080800002066d656d6f72790200046d61696e00000a8a8080800001848080800000412a0b';

const initializeWasm = async () => {
  try {
    const wasmBuffer = arrayBufferFromHex(PROGRAM_WASM_HEX);
    wasm = await WebAssembly.instantiate(wasmBuffer);
  } catch (error) {
    console.error('Failed to initialize WebAssembly module.', error);
    throw error;
  }
};

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  if (!wasm) {
    await initializeWasm();
  }

  switch (requestObject.method) {
    case 'callWasm':
      return wasm.instance.exports.main();

    // TODO: Do something with simple.wasm

    default:
      throw ethErrors.rpc.methodNotFound({ data: { request: requestObject } });
  }
});

// kudos: https://stackoverflow.com/a/71083193
function arrayBufferFromHex(hexString) {
  return new Uint8Array(
    hexString
      .replace(/^0x/i, '')
      .match(/../g)
      .map((byte) => parseInt(byte, 16)),
  ).buffer;
}
