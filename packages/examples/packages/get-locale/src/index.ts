import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import { DialogType } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';

// Fallback language, to be used if we don't have a valid translation in
// the requested locale.
const FALLBACK_LANGUAGE = 'en';

// Object containing translation strings for different translation keys
// in multiple locales.
const TRANSLATIONS: Record<string, Record<string, string>> = {
  greeting: {
    en: 'Hello $1!',
    da: 'Hej $1!',
  },
  greetingBody: {
    en: 'This is a dialog!',
    da: 'Dette er en dialog!',
  },
};

/**
 * Get a translated message given a locale, a translation key, and some optional
 * arguments. The arguments replace the placeholders in the translation.
 *
 * In a real world scenario, this function would likely be implemented by some
 * translation library, but for the sake of simplicity, we're just using a
 * simple function here.
 *
 * @param locale - The currently selected user locale.
 * @param translationKey - The key of the message in {@link TRANSLATIONS}
 * to translate.
 * @param args - An optional array of arguments for the translation.
 * @returns The translated string.
 * @throws If the `translationKey` does not exist.
 */
const translate = (locale: string, translationKey: string, args?: string[]) => {
  const translationsForKey = TRANSLATIONS[translationKey];
  assert(translationsForKey, `Unknown translation key: ${translationKey}.`);

  const translatedString =
    translationsForKey[locale] ?? translationsForKey[FALLBACK_LANGUAGE];
  assert(translatedString, `Invalid translation key: ${translationKey}`);

  if (args) {
    return args.reduce((str, arg, index) => {
      return str.replace(`$${index + 1}`, arg);
    }, translatedString);
  }

  return translatedString;
};

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `hello`: Shows an alert dialog with a localized message. This uses the
 * `snap_getLocale` JSON-RPC method to get the locale of the user's MetaMask
 * instance.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @param params.origin - The origin that made the RPC request.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getlocale
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  request,
  origin,
}) => {
  switch (request.method) {
    case 'hello': {
      const locale = await snap.request({ method: 'snap_getLocale' });

      const header = translate(locale, 'greeting', [origin]);
      const body = translate(locale, 'greetingBody');

      return snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel([heading(header), text(body)]),
        },
      });
    }

    default:
      throw rpcErrors.methodNotFound({
        data: { method: request.method },
      });
  }
};
