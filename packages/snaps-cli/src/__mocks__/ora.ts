class MockSpinner {
  isSpinning = true;

  text = '';

  start = jest.fn();

  succeed = jest.fn();

  fail = jest.fn();

  stop = jest.fn();

  clear = jest.fn();

  frame = jest.fn();

  render = jest.fn();
}

/**
 * Create a mock of the ora spinner.
 *
 * @returns The ora spinner mock.
 */
const ora = jest.fn().mockImplementation(() => new MockSpinner());
export default ora;
