import { PermissionConstraint } from '@metamask/permission-controller';
import { Json } from '@metamask/utils';

import { getBip32EntropyBuilder } from '../getBip32Entropy';
import { getBip32PublicKeyBuilder } from '../getBip32PublicKey';
import { getBip44EntropyBuilder } from '../getBip44Entropy';
import { invokeSnapBuilder } from '../invokeSnap';
import {
  manageAccountsBuilder,
  manageAccountsCaveatMapper,
  manageAccountsCaveatSpecification,
} from '../manageAccounts';
import {
  permittedCoinTypesCaveatMapper,
  PermittedCoinTypesCaveatSpecification,
} from './permittedCoinTypes';
import {
  permittedDerivationPathsCaveatMapper,
  PermittedDerivationPathsCaveatSpecification,
} from './permittedDerivationPaths';
import { snapIdsCaveatMapper, SnapIdsCaveatSpecification } from './snapIds';

export const caveatSpecifications = {
  ...PermittedDerivationPathsCaveatSpecification,
  ...PermittedCoinTypesCaveatSpecification,
  ...SnapIdsCaveatSpecification,
  ...manageAccountsCaveatSpecification,
} as const;

export const caveatMappers: Record<
  string,
  (value: Json) => Pick<PermissionConstraint, 'caveats'>
> = {
  [getBip32EntropyBuilder.targetName]: permittedDerivationPathsCaveatMapper,
  [getBip32PublicKeyBuilder.targetName]: permittedDerivationPathsCaveatMapper,
  [getBip44EntropyBuilder.targetName]: permittedCoinTypesCaveatMapper,
  [invokeSnapBuilder.targetName]: snapIdsCaveatMapper,
  [manageAccountsBuilder.targetName]: manageAccountsCaveatMapper,
};
