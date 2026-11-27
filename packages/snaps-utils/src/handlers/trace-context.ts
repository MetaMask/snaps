import type { Infer } from '@metamask/superstruct';
import {
  array,
  object,
  optional,
  pattern,
  refine,
  size,
  string,
} from '@metamask/superstruct';

/**
 * A W3C `traceparent`: version, trace ID, parent span ID and flags, in hex.
 *
 * @see https://www.w3.org/TR/trace-context/#traceparent-header
 */
const TraceparentStruct = pattern(
  string(),
  /^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/u,
);

/**
 * A W3C `baggage` value, in printable ASCII so it is always a valid header.
 *
 * @see https://www.w3.org/TR/baggage/#limits
 */
const BaggageStruct = size(pattern(string(), /^[\x20-\x7e]+$/u), 1, 8192);

/**
 * An exact, serialized origin such as `https://example.com` or
 * `http://localhost:8080`, compared verbatim against request URL origins.
 */
const OriginStruct = refine(string(), 'Origin', (value) => {
  try {
    return new URL(value).origin === value;
  } catch {
    return false;
  }
});

/**
 * Trace context of a client-owned span. Forwarded only to `origins`, since the
 * headers force a CORS preflight that other servers may reject.
 */
export const TraceContextStruct = object({
  traceparent: TraceparentStruct,
  baggage: optional(BaggageStruct),
  origins: size(array(OriginStruct), 1, Infinity),
});

export type TraceContext = Infer<typeof TraceContextStruct>;
