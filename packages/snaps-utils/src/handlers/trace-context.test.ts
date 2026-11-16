import { is } from '@metamask/superstruct';

import { TraceContextStruct } from './trace-context';

describe('TraceContextStruct', () => {
  const TRACEPARENT = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';

  const ORIGINS = ['https://metamask.io'];

  it.each([
    { traceparent: TRACEPARENT, origins: ORIGINS },
    {
      traceparent: TRACEPARENT,
      baggage: 'sentry-sample_rate=0.5,foo=bar',
      origins: ['https://metamask.io', 'http://localhost:8080'],
    },
  ])('accepts %p', (value) => {
    expect(is(value, TraceContextStruct)).toBe(true);
  });

  it.each([
    undefined,
    null,
    {},
    { traceparent: '', origins: ORIGINS },
    { traceparent: TRACEPARENT.toUpperCase(), origins: ORIGINS },
    { traceparent: `${TRACEPARENT}\r\nX-Injected: 1`, origins: ORIGINS },
    { traceparent: TRACEPARENT, baggage: '', origins: ORIGINS },
    {
      traceparent: TRACEPARENT,
      baggage: 'foo=bar\r\nX-Injected: 1',
      origins: ORIGINS,
    },
    { traceparent: TRACEPARENT, baggage: 'a'.repeat(8193), origins: ORIGINS },
    { traceparent: TRACEPARENT, tracestate: 'foo=bar', origins: ORIGINS },
    { traceparent: TRACEPARENT },
    { traceparent: TRACEPARENT, origins: [] },
    { traceparent: TRACEPARENT, origins: ['metamask.io'] },
    { traceparent: TRACEPARENT, origins: ['https://metamask.io/'] },
    { traceparent: TRACEPARENT, origins: ['https://metamask.io/api'] },
    { traceparent: TRACEPARENT, origins: ['https://metamask.io:443'] },
    { traceparent: TRACEPARENT, origins: ['https://MetaMask.io'] },
    { traceparent: TRACEPARENT, origins: ['*'] },
    { traceparent: TRACEPARENT, origins: [1] },
  ])('rejects %p', (value) => {
    expect(is(value, TraceContextStruct)).toBe(false);
  });
});
