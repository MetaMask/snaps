module.exports = () => {
  return {
    concurrency: 5,
    extensions: ['ts'],
    require: ['ts-node/register'],
    verbose: true,
    files: ['src/**/*.ava.test.ts'],
  };
};
