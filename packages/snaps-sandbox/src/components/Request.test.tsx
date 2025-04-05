import type { EditorProps } from '@monaco-editor/react';
import { waitFor, fireEvent } from '@testing-library/dom';
import { act } from '@testing-library/react';
import { createStore } from 'jotai';
import type { ChangeEvent } from 'react';
import { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';

import { Request } from './Request.js';
import { requestAtom } from '../state';
import { render } from '../test-utils';

vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ beforeMount, onChange, value }: EditorProps) => {
    useEffect(() => {
      beforeMount?.({
        languages: {
          json: {
            // @ts-expect-error: Partial mock.
            jsonDefaults: {
              setDiagnosticsOptions: vi.fn(),
            },
          },
        },
      });
    }, []);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      // @ts-expect-error: Partial mock.
      onChange?.(event.target.value, {});
    };

    return (
      <textarea
        data-testid="editor-textarea"
        value={value}
        onChange={handleChange}
      />
    );
  }),
  loader: {
    config: vi.fn(),
  },
}));

describe('Request', () => {
  it('renders the editor and button', async () => {
    const { getByText, getByTestId } = await act(() => render(<Request />));

    await waitFor(() => expect(getByTestId('editor')).toBeInTheDocument());
    expect(getByText('Install MetaMask Flask')).toBeInTheDocument();
  });

  it('stores the request in the global state', async () => {
    const store = createStore();
    const { getByTestId } = await act(() => render(<Request />, { store }));

    const editor = getByTestId('editor-textarea');
    fireEvent.change(editor, {
      target: { value: JSON.stringify({ method: 'eth_requestAccounts' }) },
    });

    expect(store.get(requestAtom)).toBe(
      JSON.stringify({ method: 'eth_requestAccounts' }),
    );
  });
});
