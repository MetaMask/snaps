import {
  getLocalizationFile,
  getLocalizedSnapManifest,
  translate,
} from './localization';
import { getSnapManifest } from './test-utils';

describe('getLocalizationFile', () => {
  it('returns the correct file', () => {
    const file = getLocalizationFile('en', [
      {
        locale: 'en',
        messages: {},
      },
    ]);

    expect(file?.locale).toBe('en');
  });

  it('returns the correct file with multiple files', () => {
    const file = getLocalizationFile('nl', [
      {
        locale: 'en',
        messages: {},
      },
      {
        locale: 'nl',
        messages: {},
      },
    ]);

    expect(file?.locale).toBe('nl');
  });

  it('returns the correct file with multiple files in a different order', () => {
    const file = getLocalizationFile('en', [
      {
        locale: 'nl',
        messages: {},
      },
      {
        locale: 'en',
        messages: {},
      },
    ]);

    expect(file?.locale).toBe('en');
  });

  it('returns the correct file with multiple files with different locales', () => {
    const file = getLocalizationFile('en', [
      {
        locale: 'nl',
        messages: {},
      },
      {
        locale: 'en',
        messages: {},
      },
    ]);

    expect(file?.locale).toBe('en');
  });

  it('returns the correct file with multiple files with different locales in a different order', () => {
    const file = getLocalizationFile('en', [
      {
        locale: 'en',
        messages: {},
      },
      {
        locale: 'nl',
        messages: {},
      },
    ]);

    expect(file?.locale).toBe('en');
  });
});

describe('translate', () => {
  it('translates a string', () => {
    expect(
      translate('This is a {{test}}.', {
        locale: 'en',
        messages: {
          test: {
            message: 'test',
          },
        },
      }),
    ).toBe('This is a test.');
  });

  it('supports spaces in the key', () => {
    expect(
      translate('This is a {{test key}}.', {
        locale: 'en',
        messages: {
          'test key': {
            message: 'test',
          },
        },
      }),
    ).toBe('This is a test.');
  });

  it('supports spaces around the key', () => {
    expect(
      translate('This is a {{ test }}.', {
        locale: 'en',
        messages: {
          test: {
            message: 'test',
          },
        },
      }),
    ).toBe('This is a test.');
  });

  it('supports differing spaces around the key', () => {
    expect(
      translate('This is a {{test }}.', {
        locale: 'en',
        messages: {
          test: {
            message: 'test',
          },
        },
      }),
    ).toBe('This is a test.');
  });

  it('supports spaces in and around the key', () => {
    expect(
      translate('This is a {{ test key }}.', {
        locale: 'en',
        messages: {
          'test key': {
            message: 'test',
          },
        },
      }),
    ).toBe('This is a test.');
  });

  it('supports multiple translations', () => {
    expect(
      translate('This is a {{test}}. This is a {{test}}.', {
        locale: 'en',
        messages: {
          test: {
            message: 'test',
          },
        },
      }),
    ).toBe('This is a test. This is a test.');
  });

  it('supports multiple translations with spaces', () => {
    expect(
      translate('This is a {{ test }}. This is a {{ test }}.', {
        locale: 'en',
        messages: {
          test: {
            message: 'test',
          },
        },
      }),
    ).toBe('This is a test. This is a test.');
  });

  it('supports multiple translations with spaces in and around the key', () => {
    expect(
      translate('This is a {{ test key }}. This is a {{ test key }}.', {
        locale: 'en',
        messages: {
          'test key': {
            message: 'test',
          },
        },
      }),
    ).toBe('This is a test. This is a test.');
  });

  it('supports multiple translations with different keys', () => {
    expect(
      translate('This is a {{ test }}. This is a {{ test2 }}.', {
        locale: 'en',
        messages: {
          test: {
            message: 'test',
          },
          test2: {
            message: 'second test',
          },
        },
      }),
    ).toBe('This is a test. This is a second test.');
  });

  it('supports multiple translations with different keys and spaces', () => {
    expect(
      translate('This is a {{ test}}. This is a {{test2 }}.', {
        locale: 'en',
        messages: {
          test: {
            message: 'test',
          },
          test2: {
            message: 'second test',
          },
        },
      }),
    ).toBe('This is a test. This is a second test.');
  });

  it('supports multiple translations with different keys and spaces in and around the key', () => {
    expect(
      translate('This is a {{ test }}. This is a {{ second test }}.', {
        locale: 'en',
        messages: {
          test: {
            message: 'test',
          },
          'second test': {
            message: 'second test',
          },
        },
      }),
    ).toBe('This is a test. This is a second test.');
  });
});

describe('getLocalizedSnapManifest', () => {
  it('returns the original manifest if no localization files are provided', () => {
    const manifest = getSnapManifest();

    expect(getLocalizedSnapManifest(manifest, 'en', [])).toBe(manifest);
  });

  it('returns the original manifest if no localization file is found', () => {
    const manifest = getSnapManifest();

    expect(
      getLocalizedSnapManifest(manifest, 'en', [
        {
          locale: 'de',
          messages: {},
        },
      ]),
    ).toBe(manifest);
  });

  it('translates the proposed name', () => {
    const manifest = getSnapManifest({
      proposedName: 'This is {{ a test }}.',
    });

    expect(
      getLocalizedSnapManifest(manifest, 'en', [
        {
          locale: 'en',
          messages: {
            'a test': {
              message: 'a translated field',
            },
          },
        },
      ]),
    ).toStrictEqual(
      getSnapManifest({
        proposedName: 'This is a translated field.',
      }),
    );
  });

  it('translates the description', () => {
    const manifest = getSnapManifest({
      description: 'This is {{ a test }}.',
    });

    expect(
      getLocalizedSnapManifest(manifest, 'en', [
        {
          locale: 'en',
          messages: {
            'a test': {
              message: 'a translated field',
            },
          },
        },
      ]),
    ).toStrictEqual(
      getSnapManifest({
        description: 'This is a translated field.',
      }),
    );
  });

  it('translates the name and description', () => {
    const manifest = getSnapManifest({
      proposedName: '{{ proposedName }}',
      description: '{{ description }}',
    });

    expect(
      getLocalizedSnapManifest(manifest, 'en', [
        {
          locale: 'en',
          messages: {
            proposedName: {
              message: 'This is the proposed name.',
            },
            description: {
              message: 'This is the description.',
            },
          },
        },
      ]),
    ).toStrictEqual(
      getSnapManifest({
        proposedName: 'This is the proposed name.',
        description: 'This is the description.',
      }),
    );
  });

  it('translates the name and description to another language', () => {
    const manifest = getSnapManifest({
      proposedName: '{{ proposedName }}',
      description: '{{ description }}',
    });

    expect(
      getLocalizedSnapManifest(manifest, 'nl', [
        {
          locale: 'en',
          messages: {
            proposedName: {
              message: 'This is the proposed name.',
            },
            description: {
              message: 'This is the description.',
            },
          },
        },
        {
          locale: 'nl',
          messages: {
            proposedName: {
              message: 'Dit is de voorgestelde naam.',
            },
            description: {
              message: 'Dit is de beschrijving.',
            },
          },
        },
      ]),
    ).toStrictEqual(
      getSnapManifest({
        proposedName: 'Dit is de voorgestelde naam.',
        description: 'Dit is de beschrijving.',
      }),
    );
  });

  it('falls back to English if the locale does not exist', () => {
    const manifest = getSnapManifest({
      proposedName: '{{ proposedName }}',
      description: '{{ description }}',
    });

    expect(
      getLocalizedSnapManifest(manifest, 'de', [
        {
          locale: 'en',
          messages: {
            proposedName: {
              message: 'This is the proposed name.',
            },
            description: {
              message: 'This is the description.',
            },
          },
        },
        {
          locale: 'nl',
          messages: {
            proposedName: {
              message: 'Dit is de voorgestelde naam.',
            },
            description: {
              message: 'Dit is de beschrijving.',
            },
          },
        },
      ]),
    ).toStrictEqual(
      getSnapManifest({
        proposedName: 'This is the proposed name.',
        description: 'This is the description.',
      }),
    );
  });
});
