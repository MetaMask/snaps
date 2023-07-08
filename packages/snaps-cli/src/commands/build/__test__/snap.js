module.exports.onRpcRequest = ({ request }) => {
  // eslint-disable-next-line no-console
  console.log('Hello, world!');

  const { method, id } = request;
  return method + id;
};
