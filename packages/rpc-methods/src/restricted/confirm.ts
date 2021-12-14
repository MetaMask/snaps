import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/snap-controllers';
import { NonEmptyArray } from '@metamask/snap-controllers/src/utils';
import { ethErrors } from 'eth-rpc-errors';
import { isPlainObject } from '../utils';

const methodName = 'snap_confirm';

type ConfirmFields = {
  /**
   * A prompt, phrased as a question, no greater than 40 characters long.
   */
  prompt: string;

  /**
   * A description, displayed with the prompt, no greater than 140 characters
   * long.
   */
  description: string;

  /**
   * Free-from text content, no greater than 1800 characters long.
   */
  textAreaContent: string;
};

export type ConfirmMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that created the confirmation.
   * @param fields - The confirmation text field contents.
   * @returns Whether the user accepted or rejected the confirmation.
   */
  showConfirmation: (snapId: string, fields: ConfirmFields) => Promise<boolean>;
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
    args: RestrictedMethodOptions<[ConfirmFields]>,
  ): Promise<boolean> {
    const {
      params,
      context: { origin },
    } = args;

    return await showConfirmation(origin, getValidatedParams(params));
  };
}

/**
 * Validates the confirm method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated confirm method parameter object.
 */
function getValidatedParams(params: unknown): ConfirmFields {
  if (!Array.isArray(params) || !isPlainObject(params[0])) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected array params with single object.',
    });
  }

  const { prompt, description, textAreaContent } = params[0];

  if (!prompt || typeof prompt !== 'string') {
    throw ethErrors.rpc.invalidParams({
      message:
        'Must specify a non-empty string "prompt" less than 40 characters long.',
    });
  }

  if (
    !description &&
    (typeof description !== 'string' || description.length > 140)
  ) {
    throw ethErrors.rpc.invalidParams({
      message:
        '"description" must be a string no more than 140 characters long if specified.',
    });
  }

  if (
    !textAreaContent &&
    (typeof textAreaContent !== 'string' || textAreaContent.length > 1800)
  ) {
    throw ethErrors.rpc.invalidParams({
      message:
        '"textAreaContent" must be a string no more than 1800 characters long if specified.',
    });
  }

  return params[0] as ConfirmFields;
}
