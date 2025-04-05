import type { EditorProps } from '@monaco-editor/react';
import { describe, it, expect, vi } from 'vitest';

import { Response } from './Response';
import * as hooks from '../hooks';
import { render } from '../test-utils';

vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ value }: EditorProps) => {
    return <textarea data-testid="editor-textarea" value={value} />;
  }),
  loader: {
    config: vi.fn(),
  },
}));

vi.mock('../hooks');

describe('Response', () => {
  it('renders the response from the Snap', () => {
    const { getByTestId } = render(<Response />);

    expect(getByTestId('editor')).toBeInTheDocument();
  });

  it('displays the response in the editor', () => {
    vi.spyOn(hooks, 'useResponse').mockReturnValue({ result: 'Hello, world!' });

    const { getByTestId } = render(<Response />);

    const editor = getByTestId('editor-textarea');
    expect(editor).toHaveValue(
      JSON.stringify({ result: 'Hello, world!' }, null, '\t'),
    );
  });
});
