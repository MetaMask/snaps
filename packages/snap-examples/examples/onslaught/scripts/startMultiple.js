const execa = require('execa');

const { hideBin } = require('yargs/helpers');
const argv = require('yargs/yargs')(hideBin(process.argv)).command(
  '$0 <startPort> <instanceCount>',
  '',
  (yargs) => {
    yargs
      .positional('startPort', {
        describe:
          'The port of the first instance. Further instances will go upwards',
        number: true,
      })
      .positional('instanceCount', {
        describe: 'How many instances to start',
        number: true,
      });
  },
).argv;

(async () => {
  const instances = [];

  for (var i = argv.startPort; i < argv.startPort + argv.instanceCount; i++) {
    instances.push(
      execa('mm-snap', ['serve', '-p', String(i)], { stdout: 'inherit' }),
    );
  }

  await Promise.all(instances);
})().catch(console.error);
