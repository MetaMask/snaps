import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/snap-controllers';
import { NonEmptyArray } from '@metamask/snap-controllers/src/utils';
import { ethErrors } from 'eth-rpc-errors';

const methodName = 'snap_confirm';

export type ConfirmMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that created the confirmation.
   * @param prompt - The prompt to display to the user.
   * @param title - The main header that will be displayed below site origin
   * @param subtitle - The subheader that will be displayed right below the title
   * @returns Whether the user accepted or rejected the confirmation.
   */
  showConfirmation: (
    snapId: string,
    prompt: string,
    title: string,
    subtitle: string,
  ) => Promise<boolean>;
};

type ConfirmSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: ConfirmMethodHooks;
};

type ConfirmSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof methodName;
  methodImplementation: ReturnType<typeof getConfirmImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * `snap_confirm` lets the Snap display a confirmation dialog to the user.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  ConfirmSpecificationBuilderOptions,
  ConfirmSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: ConfirmSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey: methodName,
    allowedCaveats,
    methodImplementation: getConfirmImplementation(methodHooks),
  };
};

export const confirmBuilder = Object.freeze({
  targetKey: methodName,
  specificationBuilder,
  methodHooks: {
    showConfirmation: true,
  },
} as const);

function getConfirmImplementation({ showConfirmation }: ConfirmMethodHooks) {
  return async function confirmImplementation(
    args: RestrictedMethodOptions<[string, string, string]>,
  ): Promise<boolean | null> {
    const {
      params = [],
      context: { origin },
    } = args;
    const [prompt, title, subtitle] = params;

    if (!prompt || typeof prompt !== 'string') {
      throw ethErrors.rpc.invalidParams({
        message: 'Must specify a non-empty string prompt.',
      });
    }

    try {
      return await showConfirmation(
        origin,
        prompt,
        title || '',
        subtitle || '',
      );
    } catch (error) {
      return null;
    }
  };
}
