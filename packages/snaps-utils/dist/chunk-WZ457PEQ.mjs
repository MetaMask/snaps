import {
  parseJson
} from "./chunk-UNNEBOL4.mjs";

// src/localization.ts
import { getErrorMessage } from "@metamask/snaps-sdk";
import {
  create,
  object,
  optional,
  record,
  string,
  StructError
} from "superstruct";
var LOCALIZABLE_FIELDS = ["description", "proposedName"];
var LocalizationFileStruct = object({
  locale: string(),
  messages: record(
    string(),
    object({
      message: string(),
      description: optional(string())
    })
  )
});
function getValidatedLocalizationFiles(localizationFiles) {
  for (const file of localizationFiles) {
    try {
      file.result = create(parseJson(file.toString()), LocalizationFileStruct);
    } catch (error) {
      if (error instanceof StructError) {
        throw new Error(
          `Failed to validate localization file "${file.path}": ${error.message}.`
        );
      }
      if (error instanceof SyntaxError) {
        throw new Error(
          `Failed to parse localization file "${file.path}" as JSON.`
        );
      }
      throw error;
    }
  }
  return localizationFiles;
}
function getLocalizationFile(locale, localizationFiles) {
  const file = localizationFiles.find(
    (localizationFile) => localizationFile.locale === locale
  );
  if (!file) {
    return localizationFiles.find(
      (localizationFile) => localizationFile.locale === "en"
    );
  }
  return file;
}
var TRANSLATION_REGEX = /\{\{\s?([a-zA-Z0-9-_\s]+)\s?\}\}/gu;
function translate(value, file) {
  const matches = value.matchAll(TRANSLATION_REGEX);
  const array = Array.from(matches);
  return array.reduce((result, [match, key]) => {
    if (!file) {
      throw new Error(
        `Failed to translate "${value}": No localization file found.`
      );
    }
    const translation = file.messages[key.trim()];
    if (!translation) {
      throw new Error(
        `Failed to translate "${value}": No translation found for "${key.trim()}" in "${file.locale}" file.`
      );
    }
    return result.replace(match, translation.message);
  }, value);
}
function getLocalizedSnapManifest(snapManifest, locale, localizationFiles) {
  const file = getLocalizationFile(locale, localizationFiles);
  return LOCALIZABLE_FIELDS.reduce((manifest, field) => {
    const translation = translate(manifest[field], file);
    return {
      ...manifest,
      [field]: translation
    };
  }, snapManifest);
}
function validateSnapManifestLocalizations(snapManifest, localizationFiles) {
  try {
    localizationFiles.filter((file) => file.locale !== "en").forEach((file) => {
      getLocalizedSnapManifest(snapManifest, file.locale, localizationFiles);
    });
    getLocalizedSnapManifest(snapManifest, "en", localizationFiles);
  } catch (error) {
    throw new Error(
      `Failed to localize Snap manifest: ${getErrorMessage(error)}`
    );
  }
}

export {
  LOCALIZABLE_FIELDS,
  LocalizationFileStruct,
  getValidatedLocalizationFiles,
  getLocalizationFile,
  TRANSLATION_REGEX,
  translate,
  getLocalizedSnapManifest,
  validateSnapManifestLocalizations
};
//# sourceMappingURL=chunk-WZ457PEQ.mjs.map