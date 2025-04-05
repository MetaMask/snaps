import * as dom from 'react-dom/client';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-dom/client');

describe('main', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('renders the main component', async () => {
    const element = document.createElement('div');
    element.id = 'root';
    document.body.appendChild(element);

    const render = vi.fn();
    const spy = vi.spyOn(dom, 'createRoot').mockReturnValue({
      render,
      unmount: vi.fn(),
    });

    await import('./main.js');

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toBe(element);
    expect(render).toHaveBeenCalled();

    document.body.removeChild(element);
  });

  it('throws an error if the root element is not found', async () => {
    await expect(async () => import('./main.js')).rejects.toThrow(
      'No root element found.',
    );
  });
});
