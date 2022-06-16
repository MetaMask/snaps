import { getSnapSourceShasum, NpmSnapFileNames } from '@metamask/snap-controllers';
import { YargsArgs } from '../../types/yargs';
import { readSnapJsonFile } from '../manifest/manifestHandler';
import { verifyMessage } from '@ethersproject/wallet';

export = {
  command: ['verify'],
  desc: 'Verify signed Snap package',
  handler: (argv: YargsArgs) => verify(argv),
};

async function verify(_argv: YargsArgs): Promise<void> {
  console.log();

  console.log("Verifying snap signature...");

  // @ts-expect-error Spread
  const { signature, ...manifest } = await readSnapJsonFile(NpmSnapFileNames.Manifest);

  const json = JSON.stringify(manifest);

  const manifestShasum = getSnapSourceShasum(json);

  const { sig, address, msg } = signature;

  if (manifestShasum !== msg) {
    throw new Error('Manifest shasum does not match signed message');
  }

  try {
    const signer = verifyMessage(manifestShasum, sig);

    if (signer !== address) {
      throw new Error('Snap was not signed by correct address');
    }

    console.log(`\nSnap signed by ${signer}!`);
  } catch (err) {
    console.log("\nSnap was not signed correctly");
  }
}
