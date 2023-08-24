import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import { DialogType } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';

const FALLBACK_LANGUAGE = 'en';

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
 * Provides basic translation given a locale, a translation key and some optional arguments.
 *
 * @param locale - The currently selected user locale.
 * @param translationKey - The translation key to translate.
 * @param args - An optional array of arguments for the translation.
 * @returns The translated string.
 * @throws If the `translationKey` does not exist.
 */
const translate = (locale: string, translationKey: string, args?: string[]) => {
  const translationsForKey = TRANSLATIONS[translationKey];
  assert(translationsForKey, `Invalid translation key: ${translationKey}`);
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
 * - `hello`: Shows an alert dialog with a localized message.
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
          // For this example we're using `DialogType.Alert`, but you can also
          // use the literal string value "alert" here.
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
