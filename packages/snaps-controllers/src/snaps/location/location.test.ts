import HttpLocation from './http';
import LocalLocation from './local';
import { detectSnapLocation } from './location';
import NpmLocation from './npm';

describe('detectSnapLocation', () => {
  it.each(['http:', 'https:'])(
    'disallows http like protocols by default',
    (protocol) => {
      expect(() => detectSnapLocation(`${protocol}//127.0.0.1/`)).toThrow(
        'Fetching snaps from external http/https is disabled.',
      );
    },
  );

  it('disallows custom registries by default', () => {
    expect(() => detectSnapLocation('npm://foo.com/bar')).toThrow(
      'Custom NPM registries are disabled, tried to use "https://foo.com/".',
    );
  });

  it.each([
    ['npm:', NpmLocation],
    ['local:', LocalLocation],
    ['http:', HttpLocation],
    ['https:', HttpLocation],
  ])('detects %s protocol', (protocol, classObj) => {
    expect(
      detectSnapLocation(`${protocol}localhost/foo`, {
        allowHttp: true,
        allowCustomRegistries: true,
      }),
    ).toBeInstanceOf(classObj);
  });

  it('throws on unrecognized protocol', () => {
    expect(() => detectSnapLocation('foo://bar.com/asd')).toThrow(
      `Unrecognized "foo:" snap location protocol.`,
    );
  });
});
