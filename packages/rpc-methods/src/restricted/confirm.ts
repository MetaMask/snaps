import { ethErrors } from 'eth-rpc-errors';
import {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/snap-controllers';
import { NonEmptyArray } from '@metamask/snap-controllers/src/utils';

const methodName = 'snap_confirm';

export type ConfirmMethodHooks = {
  /**
   *
   * @param prompt - The prompt to display to the user.
   * @returns Whether the user accepted or rejected the confirmation.
   */
  showConfirmation: (prompt: string) => Promise<boolean>;
};

type ConfirmSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: ConfirmMethodHooks;
};

type ConfirmSpecification = ValidPermissionSpecification<{
  targetKey: typeof methodName;
  methodImplementation: ReturnType<typeof getConfirmImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * `snap_confirm` lets the Snap display a confirmation dialog to the user.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  ConfirmSpecificationBuilderOptions,
  ConfirmSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: ConfirmSpecificationBuilderOptions) => {
  return {
    targetKey: methodName,
    allowedCaveats,
    methodImplementation: getConfirmImplementation(methodHooks),
  };
};

export const confirmBuilder = {
  targetKey: methodName,
  specificationBuilder,
  methodHooks: {
    showConfirmation: true,
  },
} as const;

function getConfirmImplementation({ showConfirmation }: ConfirmMethodHooks) {
  return async function confirmImplementation(
    args: RestrictedMethodOptions<[string]>,
  ): Promise<null> {
    const { params = [], context } = args;
    const [prompt] = params;

    if (!prompt || typeof prompt !== 'string') {
      throw ethErrors.rpc.invalidParams({
        message: 'Must specify a non-empty string prompt.',
      });
    }

    try {
      await showConfirmation(
        `MetaMask Confirmation\n${context.origin} asks:\n${prompt}`,
      );
      return null;
    } catch (error) {
      return null;
    }
  };
}
