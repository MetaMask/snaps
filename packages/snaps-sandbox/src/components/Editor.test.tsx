import type { EditorProps } from '@monaco-editor/react';
import { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Editor } from './Editor';
import { render } from '../test-utils';

const setDiagnosticsOptions = vi.hoisted(() => vi.fn());

vi.mock('monaco-editor');
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ beforeMount }: EditorProps) => {
    useEffect(() => {
      beforeMount?.({
        languages: {
          json: {
            // @ts-expect-error: Partial mock.
            jsonDefaults: {
              setDiagnosticsOptions,
            },
          },
        },
      });
    }, []);

    return <textarea />;
  }),
  loader: {
    config: vi.fn(),
  },
}));

describe('Editor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Monaco editor', () => {
    const { getByTestId } = render(<Editor />);

    expect(getByTestId('editor')).toBeInTheDocument();
    expect(setDiagnosticsOptions).toHaveBeenCalled();
  });
});
