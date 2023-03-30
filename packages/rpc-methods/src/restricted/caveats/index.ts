import { PermissionConstraint } from '@metamask/permission-controller';
import { Json } from '@metamask/utils';

import { getBip32EntropyBuilder } from '../getBip32Entropy';
import { getBip32PublicKeyBuilder } from '../getBip32PublicKey';
import { getBip44EntropyBuilder } from '../getBip44Entropy';
import {
  permittedCoinTypesCaveatMapper,
  PermittedCoinTypesCaveatSpecification,
} from './permittedCoinTypes';
import {
  permittedDerivationPathsCaveatMapper,
  PermittedDerivationPathsCaveatSpecification,
} from './permittedDerivationPaths';
import { SnapIdsCaveatSpecification } from './snapIds';

export const caveatSpecifications = {
  ...PermittedDerivationPathsCaveatSpecification,
  ...PermittedCoinTypesCaveatSpecification,
  ...SnapIdsCaveatSpecification,
} as const;

export const caveatMappers: Record<
  string,
  (value: Json) => Pick<PermissionConstraint, 'caveats'>
> = {
  [getBip32EntropyBuilder.targetKey]: permittedDerivationPathsCaveatMapper,
  [getBip32PublicKeyBuilder.targetKey]: permittedDerivationPathsCaveatMapper,
  [getBip44EntropyBuilder.targetKey]: permittedCoinTypesCaveatMapper,
};
