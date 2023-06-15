import { render } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

import { App } from './App';
import { Root } from './components';
import { createStore } from './store';

describe('App', () => {
  it('renders', () => {
    // This polyfills Request which seems to be missing in the Jest testing environment.
    fetchMock.enableMocks();
    expect(() =>
      render(
        <Root store={createStore()}>
          <App />
        </Root>,
      ),
    ).not.toThrow();
  });
});
