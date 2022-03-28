const { ethErrors } = require('eth-rpc-errors');

// Ref:
// - https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API
// - https://github.com/mdn/webassembly-examples/tree/06556204f687c00a5d9d3ab55805204cbb711d0c/js-api-examples

let wasm;

// See scripts/makeWasm.js for how this was created.
const PROGRAM_WASM_HEX =
  '0061736d0100000001060160017f017f0302010004040170000105030100000614037f0041080b7f01418880010b7f00418880010b071002036669620000066d656d6f727902000906010041010b000a40013e01047f4100210141012102200041004a044002400340200041016b2200210320030440200120026a210420022101200421020c010b0b0b20020f0b20010b';

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
      return wasm.instance.exports.fib(requestObject.params[0]);

    default:
      throw ethErrors.rpc.methodNotFound({ data: { request: requestObject } });
  }
});

// kudos: https://stackoverflow.com/a/71083193
function arrayBufferFromHex(hexString) {
  return new Uint8Array(
    hexString
      .replace(/^0x/iu, '')
      .match(/../gu)
      .map((byte) => parseInt(byte, 16)),
  ).buffer;
}
