import { HttpLocation } from './http';
import { LocalLocation } from './local';
import { detectSnapLocation } from './location';
import { NpmLocation } from './npm';

describe('detectSnapLocation', () => {
  it.each(['http:', 'https:'])(
    'disallows http like protocols by default',
    (protocol) => {
      expect(() => detectSnapLocation(`${protocol}//127.0.0.1/`)).toThrow(
        'Fetching snaps through http/https is disabled.',
      );
    },
  );

  it('disallows custom registries by default', () => {
    expect(() =>
      detectSnapLocation('npm://foo.com/bar', { fetch: jest.fn() }),
    ).toThrow(
      'Custom NPM registries are disabled, tried to use "https://foo.com/".',
    );
  });

  it('disallows local snaps by default', () => {
    expect(() =>
      detectSnapLocation('local:http://localhost', { fetch: jest.fn() }),
    ).toThrow('Fetching local snaps is disabled.');
  });

  it.each([
    ['npm:package', NpmLocation],
    ['local:http://localhost', LocalLocation],
    ['https://localhost', HttpLocation],
    ['http://localhost', HttpLocation],
  ])('detects %s', (url, classObj) => {
    expect(
      detectSnapLocation(url, {
        fetch: jest.fn(),
        allowHttp: true,
        allowLocal: true,
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
