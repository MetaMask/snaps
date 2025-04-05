import { describe, it, expect } from 'vitest';

import { Sidebar } from './Sidebar';
import { render } from '../test-utils';

describe('Sidebar', () => {
  it('renders the sidebar component', () => {
    const { getByText } = render(<Sidebar />);

    expect(getByText('Snaps Sandbox')).toBeInTheDocument();
    expect(getByText('Previous requests')).toBeInTheDocument();
  });
});
