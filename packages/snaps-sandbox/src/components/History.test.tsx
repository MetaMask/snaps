import { screen } from '@testing-library/react';
import { createStore } from 'jotai';
import { describe, it, expect } from 'vitest';

import { History } from './History';
import { historyAtom } from '../state';
import { render } from '../test-utils';

describe('History', () => {
  it('renders the history component', () => {
    render(<History />);

    expect(screen.getByText('Previous requests')).toBeInTheDocument();
  });

  it('renders the history items', () => {
    const store = createStore();
    store.set(historyAtom, [
      {
        timestamp: 12345,
        title: 'Request 1',
        request: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'foo',
        }),
      },
      {
        timestamp: 67890,
        title: 'Request 2',
        request: JSON.stringify({
          id: 2,
          jsonrpc: '2.0',
          method: 'bar',
        }),
      },
    ]);

    render(<History />, { store });

    expect(screen.getByText('Request 1')).toBeInTheDocument();
    expect(screen.getByText('Request 2')).toBeInTheDocument();
  });
});
