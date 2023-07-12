import type {
  SubjectPermissions,
  PermissionConstraint,
} from '@metamask/permission-controller';
import { is } from 'superstruct';

import { SnapCaveatType } from './caveats';
import {
  isSnapPermitted,
  HttpSnapIdStruct,
  isCaipChainId,
  LocalSnapIdStruct,
  NpmSnapIdStruct,
  assertIsValidSnapId,
  verifyRequestedSnapPermissions,
  stripSnapPrefix,
} from './snaps';
import { uri, WALLET_SNAP_PERMISSION_KEY } from './types';

describe('assertIsValidSnapId', () => {
  it.each([undefined, {}, null, true, 2])(
    'throws for non-strings (#%#)',
    (value) => {
      expect(() => assertIsValidSnapId(value)).toThrow(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Invalid snap ID: Expected the value to satisfy a union of \`intersection | string\`, but received: ${value}.`,
      );
    },
  );

  it('throws for invalid snap id', () => {
    expect(() => assertIsValidSnapId('foo:bar')).toThrow(
      `Invalid snap ID: Expected the value to satisfy a union of \`intersection | string\`, but received: "foo:bar".`,
    );
  });

  it('supports valid NPM IDs', () => {
    expect(() =>
      assertIsValidSnapId('npm:@metamask/test-snap-bip44'),
    ).not.toThrow();
  });

  it('supports valid local IDs', () => {
    expect(() =>
      assertIsValidSnapId('local:http://localhost:8000'),
    ).not.toThrow();
  });

  it.each([
    ' local:http://localhost:8000',
    'local:http://localhost:8000 ',
    'local:http://localhost:8000\n',
    'local:http://localhost:8000\r',
  ])('disallows whitespace #%#', (value) => {
    expect(() => assertIsValidSnapId(value)).toThrow(
      /Invalid snap ID: Expected the value to satisfy a union of `intersection \| string`, but received: .+\./u,
    );
  });

  it.each(['local:😎', 'local:␡'])(
    'disallows non-ASCII symbols #%#',
    (value) => {
      expect(() => assertIsValidSnapId(value)).toThrow(
        `Invalid snap ID: Expected the value to satisfy a union of \`intersection | string\`, but received: "${value}".`,
      );
    },
  );
});

describe('isCaipChainId', () => {
  it.each([undefined, {}, null, true, 2])(
    'returns false for non-strings (#%#)',
    (value) => {
      expect(isCaipChainId(value)).toBe(false);
    },
  );

  it.each([
    'eip155:1',
    'cosmos:iov-mainnet',
    'bip122:000000000019d6689c085ae165831e93',
    'cosmos:cosmoshub-2',
  ])('returns true for valid IDs (#%#)', (value) => {
    expect(isCaipChainId(value)).toBe(true);
  });
});

describe('LocalSnapIdStruct', () => {
  it.each([
    'local:http://localhost',
    'local:http://localhost/',
    'local:http://localhost/',
    'local:https://localhost',
    'local:https://localhost/',
    'local:http://127.0.0.1/foo/bar',
    'local:http://127.0.0.1:8080/',
    'local:http://localhost:8080/',
    'local:http://[::1]:8080/',
    'local:http://[::1]',
    'local:https://foo@localhost/',
    'local:http://foo:bar@127.0.01/',
  ])('validates "%s" as proper local ID', (value) => {
    expect(is(value, LocalSnapIdStruct)).toBe(true);
  });

  it.each([
    0,
    1,
    '',
    'foo',
    false,
    true,
    {},
    [],
    uri,
    URL,
    new URL('http://127.0.01'),
    new URL('local:127.0.0.1'),
    'http://localhost',
    '127.0.0.1',
    'local:127.0.0.1',
    'local:127.0.0.1/',
    'local:foo://127.0.0.1/',
    'local:http://github.com',
    'local:http://localhost/foo?bar=true',
    'local:http://localhost/foo#bar',
    'local:http://localhost/42?foo=true#bar',
    'local',
    'local:',
    'local:http://',
  ])('invalidates an improper local ID (#%#)', (value) => {
    expect(is(value, LocalSnapIdStruct)).toBe(false);
  });
});

describe('NpmSnapIdStruct', () => {
  it.each([
    'npm:foo',
    'npm:foo-bar',
    'npm://registry.com/foo',
    'npm:@foo/bar',
    'npm://registry.com/@foo/bar',
    'npm://user@registry.com/bar',
    'npm://user:pass@registry.com/bar',
    'npm://[::1]/bar',
    'npm://[::1]:8080/bar',
  ])('validates "%s" as proper NPM ID', (value) => {
    expect(is(value, NpmSnapIdStruct)).toBe(true);
  });

  it.each([
    0,
    1,
    false,
    true,
    {},
    [],
    uri,
    URL,
    '',
    'npm:',
    'npm',
    'npm:http://registry.com/foo',
    'npm://registry.com',
    'npm://registry.com/',
    'npm:foo#bar',
    'npm:foo?bar=true',
    'npm:snap?foo=true#bar',
    'npm://registry.com/snap?foo=true',
    'npm://registry.com/snap#foo',
    'npm://registry.com/snap?foo=true#bar',
    'local:foo',
    'local://registry.com/foo',
    'foo:bar',
    'npm:ASDASDasd',
    'npm:.',
    'npm:excited!',
    // 220 characters, limit is 214
    'npm:abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghij',
    new URL('npm:foo'),
    new URL('npm://registry.com/foo'),
  ])('invalidates an improper NPM ID (#%#)', (value) => {
    expect(is(value, NpmSnapIdStruct)).toBe(false);
  });
});

describe('HttpSnapIdStruct', () => {
  it.each([
    'http://[::1]',
    'http://[::1]:8080',
    'http://localhost',
    'http://localhost/',
    'https://localhost',
    'https://localhost/',
    'http://github.com',
    'http://github.com/foo',
    'http://gihtub.com/@foo/bar',
    'https://github.com/@foo/bar',
  ])('validates "%s" as proper http ID', (value) => {
    expect(is(value, HttpSnapIdStruct)).toBe(true);
  });

  it.each([
    0,
    1,
    false,
    true,
    {},
    [],
    uri,
    URL,
    new URL('http://github.com'),
    '',
    'http',
    'http:',
    'http://',
    'foo://localhost',
    'npm://localhost',
    'npm:localhost',
    'local:http://localhost',
    'http://github.com/?foo=true',
    'http://github.com/#foo',
    'http://github.com/?foo=true#bar',
    'http://github.com/snap?foo=true#bar',
  ])('invalidates an improper http ID (#%#)', (value) => {
    expect(is(value, HttpSnapIdStruct)).toBe(false);
  });
});

describe('isSnapPermitted', () => {
  it("will check an origin's permissions object to see if it has permission to interact with a specific snap", () => {
    const validPermissions: SubjectPermissions<PermissionConstraint> = {
      [WALLET_SNAP_PERMISSION_KEY]: {
        date: 1,
        id: '1',
        invoker: 'example.com',
        parentCapability: 'wallet_snap',
        caveats: [
          {
            type: 'snapIds',
            value: {
              foo: {},
            },
          },
        ],
      },
    };

    const invalidPermissions1: SubjectPermissions<PermissionConstraint> = {
      [WALLET_SNAP_PERMISSION_KEY]: {
        date: 1,
        id: '1',
        invoker: 'example.com',
        parentCapability: 'wallet_snap',
        caveats: [
          {
            type: 'snapIds',
            value: {
              bar: {},
            },
          },
        ],
      },
    };

    const invalidPermissions2: SubjectPermissions<PermissionConstraint> = {
      foo: {
        date: 1,
        id: '1',
        invoker: 'example.com',
        parentCapability: 'foo',
        caveats: null,
      },
    };

    expect(isSnapPermitted(validPermissions, 'foo')).toBe(true);
    expect(isSnapPermitted(invalidPermissions1, 'foo')).toBe(false);
    expect(isSnapPermitted(invalidPermissions2, 'foo')).toBe(false);
  });

  describe('verifyRequestedSnapPermissions', () => {
    it.each([
      { request: null, error: 'Requested permissions must be an object.' },
      {
        request: { foo: {} },
        error: `${WALLET_SNAP_PERMISSION_KEY} is missing from the requested permissions.`,
      },
      {
        request: { [WALLET_SNAP_PERMISSION_KEY]: { caveats: null } },
        error: `${WALLET_SNAP_PERMISSION_KEY} must have a caveat property with a single-item array value.`,
      },
      {
        request: { [WALLET_SNAP_PERMISSION_KEY]: { caveats: [{}, {}] } },
        error: `${WALLET_SNAP_PERMISSION_KEY} must have a caveat property with a single-item array value.`,
      },
      {
        request: { [WALLET_SNAP_PERMISSION_KEY]: { caveats: [{ foo: {} }] } },
        error: `The requested permissions do not have a valid ${SnapCaveatType.SnapIds} caveat.`,
      },
      {
        request: {
          [WALLET_SNAP_PERMISSION_KEY]: {
            caveats: [{ type: SnapCaveatType.SnapIds, foo: {} }],
          },
        },
        error: `The requested permissions do not have a valid ${SnapCaveatType.SnapIds} caveat.`,
      },
    ])('will throw in failure scenarios', (test) => {
      expect(() => verifyRequestedSnapPermissions(test.request)).toThrow(
        test.error,
      );
    });
  });
});

describe('stripSnapPrefix', () => {
  it('strips local prefixes', () => {
    expect(stripSnapPrefix('local:http://localhost:8080')).toBe(
      'http://localhost:8080',
    );
  });

  it('strips npm prefixes', () => {
    expect(stripSnapPrefix('npm:@metamask/test-snap-bip32')).toBe(
      '@metamask/test-snap-bip32',
    );
  });
});
