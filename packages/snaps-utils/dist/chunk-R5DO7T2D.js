"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk7VJ2BOVUjs = require('./chunk-7VJ2BOVU.js');

// src/localization.ts
var _snapssdk = require('@metamask/snaps-sdk');







var _superstruct = require('superstruct');
var LOCALIZABLE_FIELDS = ["description", "proposedName"];
var LocalizationFileStruct = _superstruct.object.call(void 0, {
  locale: _superstruct.string.call(void 0, ),
  messages: _superstruct.record.call(void 0, 
    _superstruct.string.call(void 0, ),
    _superstruct.object.call(void 0, {
      message: _superstruct.string.call(void 0, ),
      description: _superstruct.optional.call(void 0, _superstruct.string.call(void 0, ))
    })
  )
});
function getValidatedLocalizationFiles(localizationFiles) {
  for (const file of localizationFiles) {
    try {
      file.result = _superstruct.create.call(void 0, _chunk7VJ2BOVUjs.parseJson.call(void 0, file.toString()), LocalizationFileStruct);
    } catch (error) {
      if (error instanceof _superstruct.StructError) {
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
      `Failed to localize Snap manifest: ${_snapssdk.getErrorMessage.call(void 0, error)}`
    );
  }
}










exports.LOCALIZABLE_FIELDS = LOCALIZABLE_FIELDS; exports.LocalizationFileStruct = LocalizationFileStruct; exports.getValidatedLocalizationFiles = getValidatedLocalizationFiles; exports.getLocalizationFile = getLocalizationFile; exports.TRANSLATION_REGEX = TRANSLATION_REGEX; exports.translate = translate; exports.getLocalizedSnapManifest = getLocalizedSnapManifest; exports.validateSnapManifestLocalizations = validateSnapManifestLocalizations;
//# sourceMappingURL=chunk-R5DO7T2D.js.map