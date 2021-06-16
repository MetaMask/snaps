import { JsonRpcMiddleware, Json } from 'json-rpc-engine';
import isSubset from 'is-subset';
import equal from 'fast-deep-equal';
import { ethErrors } from 'eth-rpc-errors';
import { Caveat } from './Caveat';

export type CaveatFunction<T, U> = JsonRpcMiddleware<T, U>;

export type CaveatFunctionGenerator<T, U> = (
  caveat: Caveat<Json>,
) => CaveatFunction<T, U>;

export const caveatFunctions = {
  filterResponse,
  forceParams,
  limitResponseLength,
  requireParamsIsSubset,
  requireParamsIsSuperset,
};

/**
 * Require that request.params is a subset of or equal to the caveat value.
 * Arrays are order-dependent, objects are order-independent.
 */
export function requireParamsIsSubset(
  serialized: Caveat<Record<string, Json>>,
): CaveatFunction<unknown[] | Record<string, unknown>, unknown> {
  const { value } = serialized;
  return (req, res, next, end): void => {
    // Ensure that the params are a subset of or equal to the caveat value
    if (!isSubset(value, req.params)) {
      res.error = ethErrors.provider.unauthorized({ data: req });
      return end(res.error);
    }

    return next();
  };
}

/**
 * Require that request.params is a superset of or equal to the caveat value.
 * Arrays are order-dependent, objects are order-independent.
 */
export function requireParamsIsSuperset(
  serialized: Caveat<Record<string, Json>>,
): CaveatFunction<unknown[] | Record<string, unknown>, unknown> {
  const { value } = serialized;
  return (req, res, next, end): void => {
    // Ensure that the params are a superset of or equal to the caveat value
    if (!isSubset(req.params, value)) {
      res.error = ethErrors.provider.unauthorized({ data: req });
      return end(res.error);
    }

    return next();
  };
}

/*
 * Filters array results deeply.
 */
export function filterResponse(
  serialized: Caveat<Json[]>,
): CaveatFunction<unknown, unknown[]> {
  const { value } = serialized;
  return (_req, res, next, _end): void => {
    next((done) => {
      if (Array.isArray(res.result)) {
        res.result = res.result.filter((item) => {
          const findResult = value.find((resultValue: Json) => {
            return equal(resultValue, item);
          });

          return findResult !== undefined;
        });
      }
      done();
    });
  };
}

/*
 * Limits array results to a specific integer length.
 */
export function limitResponseLength(
  serialized: Caveat<number>,
): CaveatFunction<unknown, unknown[]> {
  const { value } = serialized;
  return (_req, res, next, _end): void => {
    next((done) => {
      if (Array.isArray(res.result)) {
        res.result = res.result.slice(0, value);
      }
      done();
    });
  };
}

/*
 * Forces the method to be called with given params.
 */
export function forceParams(
  serialized: Caveat<Json[] | Record<string, Json>>,
): CaveatFunction<unknown, unknown> {
  const { value } = serialized;
  return (req, _, next): void => {
    req.params = Array.isArray(value) ? [...value] : { ...value };
    next();
  };
}
