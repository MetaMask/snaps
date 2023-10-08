import { assert } from '@metamask/utils';
/**
 * Normalizes relative paths by optionally removing `./` prefix.
 *
 * @param path - Path to make normalize.
 * @returns The same path, with `./` prefix remove.
 */ // TODO(ritave): Include NodeJS path polyfill and use path.normalize as well
export function normalizeRelative(path) {
    assert(!path.startsWith('/'));
    assert(path.search(/:|\/\//u) === -1, `Path "${path}" potentially an URI instead of local relative`);
    if (path.startsWith('./')) {
        return path.slice(2);
    }
    return path;
}

//# sourceMappingURL=path.js.map