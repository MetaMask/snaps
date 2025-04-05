import { List } from '@chakra-ui/react';
import { fireEvent } from '@testing-library/dom';
import { screen } from '@testing-library/react';
import { createStore } from 'jotai';
import { describe, it, expect } from 'vitest';

import { HistoryItem } from './HistoryItem';
import { requestAtom } from '../state';
import { render } from '../test-utils';

describe('HistoryItem', () => {
  it('renders a history item', () => {
    const entry = {
      title: 'Test Entry',
      timestamp: Date.now(),
      request: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
      }),
    };

    render(
      <List.Root>
        <HistoryItem entry={entry} />
      </List.Root>,
    );

    expect(screen.getByText('Test Entry')).toBeInTheDocument();
  });

  it('calls `setValue` with the correct request on click', () => {
    const store = createStore();

    const entry = {
      title: 'Test Entry',
      timestamp: Date.now(),
      request: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
      }),
    };

    render(
      <List.Root>
        <HistoryItem entry={entry} />
      </List.Root>,
      { store },
    );

    const button = screen.getByText('Test Entry');
    fireEvent.click(button);

    const state = store.get(requestAtom);
    expect(state).toBe(entry.request);
  });
});
