module.exports = () => {
  return {
    extensions: ['ts'],
    require: ['ts-node/register'],
    verbose: true,
    files: ['src/**/*.ava.test.ts'],
    timeout: '30s',
  };
};
