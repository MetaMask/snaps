import { List } from '@chakra-ui/react';
import { fireEvent } from '@testing-library/dom';
import { act } from '@testing-library/react';
import { createStore } from 'jotai';
import { describe, it, expect } from 'vitest';

import { HistoryItem } from './HistoryItem';
import { historyAtom, persistedHistoryAtom, requestAtom } from '../state';
import { render } from '../test-utils';

describe('HistoryItem', () => {
  it('renders a history item', () => {
    const entry = {
      id: '1',
      title: 'Test Entry',
      timestamp: Date.now(),
      request: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
      }),
    };

    const { getByText } = render(
      <List.Root>
        <HistoryItem entry={entry} />
      </List.Root>,
    );

    expect(getByText('Test Entry')).toBeInTheDocument();
  });

  it('calls `setValue` with the correct request on click', async () => {
    const store = createStore();

    const entry = {
      id: '1',
      title: 'Test Entry',
      timestamp: Date.now(),
      request: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
      }),
    };

    const { getByTestId } = render(
      <List.Root>
        <HistoryItem entry={entry} />
      </List.Root>,
      { store },
    );

    const button = getByTestId('history-item');
    await act(() => fireEvent.click(button));

    const state = store.get(requestAtom);
    expect(state).toBe(entry.request);
  });

  it('updates the history entry title on change', async () => {
    const store = createStore();

    const entry = {
      id: '1',
      title: 'Test Entry',
      timestamp: Date.now(),
      request: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
      }),
    };

    store.set(persistedHistoryAtom, [entry]);

    const { getByText, getByRole } = render(
      <List.Root>
        <HistoryItem entry={entry} />
      </List.Root>,
      { store },
    );

    const button = getByText('Test Entry');
    await act(async () => await act(() => fireEvent.click(button)));

    const input = getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(entry.title);

    await act(
      async () =>
        await act(() =>
          fireEvent.change(input, {
            target: { value: 'New Title' },
          }),
        ),
    );

    expect(store.get(historyAtom)).toStrictEqual([
      {
        ...entry,
        title: 'New Title',
      },
    ]);
  });

  it('does not call `setValue` when clicking on the input', async () => {
    const store = createStore();

    const entry = {
      id: '1',
      title: 'Test Entry',
      timestamp: Date.now(),
      request: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
      }),
    };

    const { getByText } = render(
      <List.Root>
        <HistoryItem entry={entry} />
      </List.Root>,
      { store },
    );

    const input = getByText('Test Entry');
    await act(async () => await act(() => fireEvent.click(input)));

    expect(store.get(requestAtom)).not.toBe(entry.request);
  });
});
