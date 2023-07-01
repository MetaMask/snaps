import { blue, dim, red, yellow } from 'chalk';
import { Ora } from 'ora';

import { error, indent, info, warn } from './logging';

describe('indent', () => {
  it('indents a string by a given number of spaces', () => {
    expect(indent('foo')).toBe('  foo');
    expect(indent('foo', 4)).toBe('    foo');
    expect(indent('foo\nbar')).toBe('  foo\n  bar');
    expect(indent('foo\nbar', 4)).toBe('    foo\n    bar');
  });
});

describe('warn', () => {
  it('logs a warning message', () => {
    const log = jest.spyOn(console, 'warn').mockImplementation();

    warn('foo');
    expect(log).toHaveBeenCalledWith(`${yellow('⚠')} foo`);
  });

  it('clears a spinner if provided', () => {
    jest.spyOn(console, 'warn').mockImplementation();

    const spinner = { clear: jest.fn(), frame: jest.fn() } as unknown as Ora;
    warn('foo', spinner);

    expect(spinner.clear).toHaveBeenCalled();
    expect(spinner.frame).toHaveBeenCalled();
  });
});

describe('info', () => {
  it('logs an info message', () => {
    const log = jest.spyOn(console, 'log').mockImplementation();

    info('foo');
    expect(log).toHaveBeenCalledWith(`${blue('ℹ')} ${dim('foo')}`);
  });

  it('clears a spinner if provided', () => {
    jest.spyOn(console, 'log').mockImplementation();

    const spinner = { clear: jest.fn(), frame: jest.fn() } as unknown as Ora;
    info('foo', spinner);

    expect(spinner.clear).toHaveBeenCalled();
    expect(spinner.frame).toHaveBeenCalled();
  });
});

describe('error', () => {
  it('logs an error message', () => {
    const log = jest.spyOn(console, 'error').mockImplementation();

    error('foo');
    expect(log).toHaveBeenCalledWith(`${red('✖')} foo`);
  });

  it('clears a spinner if provided', () => {
    jest.spyOn(console, 'error').mockImplementation();

    const spinner = { clear: jest.fn(), frame: jest.fn() } as unknown as Ora;
    error('foo', spinner);

    expect(spinner.clear).toHaveBeenCalled();
    expect(spinner.frame).toHaveBeenCalled();
  });
});
