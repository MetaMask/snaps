import { getMockOptions } from '../../../test-utils';
import { createStore } from './store';

describe('createStore', () => {
  it('creates a Redux store', () => {
    const { store } = createStore(getMockOptions());

    expect(store).toBeDefined();
    expect(store.getState()).toMatchInlineSnapshot(`
      {
        "notifications": {
          "notifications": [],
        },
        "state": {
          "encrypted": null,
          "unencrypted": null,
        },
        "ui": {
          "current": null,
        },
      }
    `);
  });

  it('creates a Redux store with initial state', () => {
    const { store } = createStore(
      getMockOptions({
        state: {
          foo: 'bar',
        },
      }),
    );

    expect(store).toBeDefined();
    expect(store.getState()).toMatchInlineSnapshot(`
      {
        "notifications": {
          "notifications": [],
        },
        "state": {
          "encrypted": "{"foo":"bar"}",
          "unencrypted": "{"foo":"bar"}",
        },
        "ui": {
          "current": null,
        },
      }
    `);
  });
});
