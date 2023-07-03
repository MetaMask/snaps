/* eslint-disable */

// This intentionally does not exist.
const foo = require('./bar');

module.exports.onRpcRequest = ({ request }) => {
  console.log('Hello, world!', foo);

  const { method, id } = request;
  return method + id;
};
