import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { isObject, NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

const methodName = 'snap_confirm';

type ConfirmFields = {
  /**
   * A prompt, phrased as a question, no greater than 40 characters long.
   */
  title: string;

  /**
   * A description, displayed with the prompt, no greater than 140 characters
   * long.
   */
  description?: string;

  /**
   * Free-from text content, no greater than 1800 characters long.
   */
  textAreaContent?: string;
};

/**
 * For backwards compatibility.
 */
type LegacyConfirmFields = Omit<ConfirmFields, 'title'> & {
  /**
   * A prompt, phrased as a question, no greater than 40 characters long.
   */
  prompt: string;
};

/**
 * @deprecated Use `snap_dialog` instead.
 */
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
 * The specification builder for the `snap_confirm` permission.
 * `snap_confirm` lets the Snap display a confirmation dialog to the user.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_confirm` permission.
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

/**
 * @deprecated Use `snap_dialog` instead.
 */
export const confirmBuilder = Object.freeze({
  targetKey: methodName,
  specificationBuilder,
  methodHooks: {
    showConfirmation: true,
  },
} as const);

/**
 * Builds the method implementation for `snap_confirm`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showConfirmation - A function that shows a confirmation in the MetaMask UI and returns a `boolean` that signals whether the user approved or denied the confirmation.
 * @returns The method implementation which returns `true` if the user approved the confirmation, otherwise `false`.
 */
function getConfirmImplementation({ showConfirmation }: ConfirmMethodHooks) {
  return async function confirmImplementation(
    args: RestrictedMethodOptions<[LegacyConfirmFields]>,
  ): Promise<boolean> {
    console.warn('snap_confirm is deprecated. Use snap_dialog instead.');

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
  if (!Array.isArray(params) || !isObject(params[0])) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected array params with single object.',
    });
  }

  const { prompt, ...extraFields } = params[0];
  const { description, textAreaContent } = extraFields;

  if (!prompt || typeof prompt !== 'string' || prompt.length > 40) {
    throw ethErrors.rpc.invalidParams({
      message:
        'Must specify a non-empty string "prompt" less than 40 characters long.',
    });
  }

  if (
    description &&
    (typeof description !== 'string' || description.length > 140)
  ) {
    throw ethErrors.rpc.invalidParams({
      message:
        '"description" must be a string no more than 140 characters long if specified.',
    });
  }

  if (
    textAreaContent &&
    (typeof textAreaContent !== 'string' || textAreaContent.length > 1800)
  ) {
    throw ethErrors.rpc.invalidParams({
      message:
        '"textAreaContent" must be a string no more than 1800 characters long if specified.',
    });
  }

  return { title: prompt, ...extraFields };
}
