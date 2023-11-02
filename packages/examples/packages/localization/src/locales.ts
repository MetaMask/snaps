import da from '../locales/da.json';
import en from '../locales/en.json';
import nl from '../locales/nl.json';

// Fallback language, to be used if we don't have a valid translation in
// the requested locale.
const FALLBACK_LANGUAGE: Locale = 'en';

export const locales = {
  da: da.messages,
  en: en.messages,
  nl: nl.messages,
};

export type Locale = keyof typeof locales;

/**
 * Get a message from the translation files.
 *
 * This uses a very basic implementation of a translation system, just for
 * demonstration purposes. It is not recommended to use this in production.
 * Instead, use a proper translation library.
 *
 * @param id - The id of the message to get.
 * @returns The message.
 */
export async function getMessage(id: keyof (typeof locales)[Locale]) {
  const locale = (await snap.request({ method: 'snap_getLocale' })) as Locale;
  const { message } = locales[locale]?.[id] ?? locales[FALLBACK_LANGUAGE][id];

  return message;
}
