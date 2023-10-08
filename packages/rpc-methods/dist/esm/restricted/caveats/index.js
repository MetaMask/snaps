import { getBip32EntropyBuilder } from '../getBip32Entropy';
import { getBip32PublicKeyBuilder } from '../getBip32PublicKey';
import { getBip44EntropyBuilder } from '../getBip44Entropy';
import { invokeSnapBuilder } from '../invokeSnap';
import { permittedCoinTypesCaveatMapper, PermittedCoinTypesCaveatSpecification } from './permittedCoinTypes';
import { permittedDerivationPathsCaveatMapper, PermittedDerivationPathsCaveatSpecification } from './permittedDerivationPaths';
import { snapIdsCaveatMapper, SnapIdsCaveatSpecification } from './snapIds';
export const caveatSpecifications = {
    ...PermittedDerivationPathsCaveatSpecification,
    ...PermittedCoinTypesCaveatSpecification,
    ...SnapIdsCaveatSpecification
};
export const caveatMappers = {
    [getBip32EntropyBuilder.targetName]: permittedDerivationPathsCaveatMapper,
    [getBip32PublicKeyBuilder.targetName]: permittedDerivationPathsCaveatMapper,
    [getBip44EntropyBuilder.targetName]: permittedCoinTypesCaveatMapper,
    [invokeSnapBuilder.targetName]: snapIdsCaveatMapper
};

//# sourceMappingURL=index.js.map