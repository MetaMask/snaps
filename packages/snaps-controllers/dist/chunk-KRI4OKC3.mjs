import {
  Timer
} from "./chunk-XO7KDFBY.mjs";

// src/utils.ts
import { assert, getErrorMessage } from "@metamask/snaps-sdk";
import {
  MAX_FILE_SIZE,
  encodeBase64,
  getValidatedLocalizationFiles,
  validateAuxiliaryFiles,
  validateFetchedSnap
} from "@metamask/snaps-utils";
import deepEqual from "fast-deep-equal";
function setDiff(objectA, objectB) {
  return Object.entries(objectA).reduce(
    (acc, [key, value]) => {
      if (!(key in objectB)) {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );
}
function permissionsDiff(permissionsA, permissionsB) {
  return Object.entries(permissionsA).reduce((acc, [key, value]) => {
    const isIncluded = key in permissionsB;
    if (!isIncluded || isIncluded && !deepEqual(value.caveats ?? [], permissionsB[key].caveats ?? [])) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
function delay(ms, result) {
  return delayWithTimer(new Timer(ms), result);
}
function delayWithTimer(timer, result) {
  let rejectFunc;
  const promise = new Promise((resolve, reject) => {
    timer.start(() => {
      result === void 0 ? resolve() : resolve(result);
    });
    rejectFunc = reject;
  });
  promise.cancel = () => {
    if (timer.status !== "finished") {
      timer.cancel();
      rejectFunc(new Error("The delay has been canceled."));
    }
  };
  return promise;
}
var hasTimedOut = Symbol(
  "Used to check if the requested promise has timeout (see withTimeout)"
);
async function withTimeout(promise, timerOrMs) {
  const timer = typeof timerOrMs === "number" ? new Timer(timerOrMs) : timerOrMs;
  const delayPromise = delayWithTimer(timer, hasTimedOut);
  try {
    return await Promise.race([promise, delayPromise]);
  } finally {
    delayPromise.cancel();
  }
}
async function getSnapFiles(location, files) {
  if (!files || files.length === 0) {
    return [];
  }
  return await Promise.all(
    files.map(async (filePath) => location.fetch(filePath))
  );
}
async function fetchSnap(snapId, location) {
  try {
    const manifest = await location.manifest();
    const sourceCode = await location.fetch(
      manifest.result.source.location.npm.filePath
    );
    assert(
      sourceCode.size < MAX_FILE_SIZE,
      "Snap source code must be smaller than 64 MB."
    );
    const { iconPath } = manifest.result.source.location.npm;
    const svgIcon = iconPath ? await location.fetch(iconPath) : void 0;
    const auxiliaryFiles = await getSnapFiles(
      location,
      manifest.result.source.files
    );
    validateAuxiliaryFiles(auxiliaryFiles);
    await Promise.all(
      auxiliaryFiles.map(async (file) => {
        file.data.base64 = await encodeBase64(file);
      })
    );
    const localizationFiles = await getSnapFiles(
      location,
      manifest.result.source.locales
    );
    const validatedLocalizationFiles = getValidatedLocalizationFiles(localizationFiles);
    const files = {
      manifest,
      sourceCode,
      svgIcon,
      auxiliaryFiles,
      localizationFiles: validatedLocalizationFiles
    };
    await validateFetchedSnap(files);
    return files;
  } catch (error) {
    throw new Error(
      `Failed to fetch snap "${snapId}": ${getErrorMessage(error)}.`
    );
  }
}

export {
  setDiff,
  permissionsDiff,
  delay,
  delayWithTimer,
  hasTimedOut,
  withTimeout,
  getSnapFiles,
  fetchSnap
};
//# sourceMappingURL=chunk-KRI4OKC3.mjs.map