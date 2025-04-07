import { createStore } from 'jotai';
import { describe, it, expect } from 'vitest';

import { History } from './History';
import { historyAtom } from '../state';
import { render } from '../test-utils';

describe('History', () => {
  it('renders the history component', () => {
    const store = createStore();
    store.set(historyAtom, {
      type: 'add',
      payload: {
        id: '1',
        timestamp: 12345,
        title: 'Request 1',
        request: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'foo',
        }),
      },
    });

    const { queryByText } = render(<History />, { store });

    expect(queryByText('Previous requests')).toBeInTheDocument();
  });

  it('renders the history items', () => {
    const store = createStore();
    store.set(historyAtom, {
      type: 'add',
      payload: {
        id: '1',
        timestamp: 12345,
        title: 'Request 1',
        request: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'foo',
        }),
      },
    });

    store.set(historyAtom, {
      type: 'add',
      payload: {
        id: '2',
        timestamp: 12346,
        title: 'Request 2',
        request: JSON.stringify({
          id: 2,
          jsonrpc: '2.0',
          method: 'bar',
        }),
      },
    });

    const { queryByText } = render(<History />, { store });

    expect(queryByText('Previous requests')).toBeInTheDocument();
    expect(queryByText('Favorite requests')).not.toBeInTheDocument();
    expect(queryByText('Request 1')).toBeInTheDocument();
    expect(queryByText('Request 2')).toBeInTheDocument();
  });

  it('renders the favorite items', () => {
    const store = createStore();
    store.set(historyAtom, {
      type: 'add',
      payload: {
        id: '1',
        timestamp: 12345,
        title: 'Request 1',
        favorite: true,
        request: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'foo',
        }),
      },
    });

    store.set(historyAtom, {
      type: 'add',
      payload: {
        id: '2',
        timestamp: 12346,
        title: 'Request 2',
        favorite: true,
        request: JSON.stringify({
          id: 2,
          jsonrpc: '2.0',
          method: 'bar',
        }),
      },
    });

    const { queryByText } = render(<History />, { store });

    expect(queryByText('Previous requests')).not.toBeInTheDocument();
    expect(queryByText('Favorite requests')).toBeInTheDocument();
    expect(queryByText('Request 1')).toBeInTheDocument();
    expect(queryByText('Request 2')).toBeInTheDocument();
  });

  it('renders the favorite and regular items', () => {
    const store = createStore();
    store.set(historyAtom, {
      type: 'add',
      payload: {
        id: '1',
        timestamp: 12345,
        title: 'Request 1',
        favorite: true,
        request: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'foo',
        }),
      },
    });

    store.set(historyAtom, {
      type: 'add',
      payload: {
        id: '2',
        timestamp: 12346,
        title: 'Request 2',
        request: JSON.stringify({
          id: 2,
          jsonrpc: '2.0',
          method: 'bar',
        }),
      },
    });

    const { queryByText } = render(<History />, { store });

    expect(queryByText('Previous requests')).toBeInTheDocument();
    expect(queryByText('Favorite requests')).toBeInTheDocument();
    expect(queryByText('Request 1')).toBeInTheDocument();
    expect(queryByText('Request 2')).toBeInTheDocument();
  });
});
