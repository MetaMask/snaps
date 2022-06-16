import { getSnapSourceShasum, NpmSnapFileNames } from '@metamask/snap-controllers';
import { YargsArgs } from '../../types/yargs';
import { readSnapJsonFile } from '../manifest/manifestHandler';

export = {
  command: ['sign'],
  desc: 'Sign Snap package',
  handler: (argv: YargsArgs) => sign(argv),
};

async function sign(_argv: YargsArgs): Promise<void> {
  console.log();

  // @ts-expect-error Spread
  const { signature, ...manifest } = await readSnapJsonFile(NpmSnapFileNames.Manifest);

  const json = JSON.stringify(manifest);

  const manifestShasum = getSnapSourceShasum(json);

  console.log(`\nPlease sign ${manifestShasum} and include the signature in your manifest`);
}
