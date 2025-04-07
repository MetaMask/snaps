import { fireEvent } from '@testing-library/dom';
import { act } from '@testing-library/react';
import { createStore } from 'jotai';
import { describe, it, expect } from 'vitest';

import { HistoryItemMenu } from './HistoryItemMenu';
import { historyAtom, persistedHistoryAtom } from '../state';
import { render } from '../test-utils';

describe('HistoryItemMenu', () => {
  it('renders a menu with options', async () => {
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

    const { getByLabelText, queryByText } = render(
      <HistoryItemMenu entry={entry} />,
    );

    const button = getByLabelText('More options');
    expect(button).toBeInTheDocument();

    await act(async () => await act(() => fireEvent.click(button)));

    expect(queryByText('Favorite')).toBeInTheDocument();
    expect(queryByText('Delete')).toBeInTheDocument();
  });

  it('deletes an entry when "Delete" is clicked', async () => {
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

    const store = createStore();
    store.set(persistedHistoryAtom, [entry]);

    const { getByLabelText, getByText } = render(
      <HistoryItemMenu entry={entry} />,
      { store },
    );

    const button = getByLabelText('More options');
    expect(button).toBeInTheDocument();

    await act(async () => await act(() => fireEvent.click(button)));

    const deleteButton = getByText('Delete');
    expect(deleteButton).toBeInTheDocument();

    await act(async () => await act(() => fireEvent.click(deleteButton)));

    expect(store.get(historyAtom)).toStrictEqual([]);
  });

  it('favorites an entry when "Favorite" is clicked', async () => {
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

    const store = createStore();
    store.set(persistedHistoryAtom, [entry]);

    const { getByLabelText, getByText } = render(
      <HistoryItemMenu entry={entry} />,
      { store },
    );

    const button = getByLabelText('More options');
    expect(button).toBeInTheDocument();

    await act(async () => await act(() => fireEvent.click(button)));

    const favoriteButton = getByText('Favorite');
    expect(favoriteButton).toBeInTheDocument();

    await act(async () => await act(() => fireEvent.click(favoriteButton)));

    expect(store.get(historyAtom)).toStrictEqual([
      { ...entry, favorite: true },
    ]);
  });
});
