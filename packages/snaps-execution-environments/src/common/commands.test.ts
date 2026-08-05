import { HandlerType } from '@metamask/snaps-utils';
import { MOCK_ORIGIN } from '@metamask/snaps-utils/test-utils';

import { getHandlerArguments } from './commands';

describe('getHandlerArguments', () => {
  it('validates the request params for the OnTransaction handler', () => {
    expect(() =>
      getHandlerArguments(MOCK_ORIGIN, null, HandlerType.OnTransaction, {
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
        params: {},
      }),
    ).toThrow('Invalid request params');
  });

  it('validates the request params for the OnSignature handler', () => {
    expect(() =>
      getHandlerArguments(MOCK_ORIGIN, null, HandlerType.OnSignature, {
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
        params: {},
      }),
    ).toThrow('Invalid request params');
  });

  it('validates the request params for the OnUserInput handler', () => {
    expect(() =>
      getHandlerArguments(MOCK_ORIGIN, null, HandlerType.OnUserInput, {
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
        params: {},
      }),
    ).toThrow('Invalid request params');
  });

  it('validates the request params for the OnAssetsConversion handler', () => {
    expect(() =>
      getHandlerArguments(MOCK_ORIGIN, null, HandlerType.OnAssetsConversion, {
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
        params: {},
      }),
    ).toThrow('Invalid request params');
  });

  it('validates the request params for the OnAssetsLookup handler', () => {
    expect(() =>
      getHandlerArguments(MOCK_ORIGIN, null, HandlerType.OnAssetsLookup, {
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
        params: {},
      }),
    ).toThrow('Invalid request params');
  });

  it('validates the request params for the OnAssetHistoricalPrice handler', () => {
    expect(() =>
      getHandlerArguments(
        MOCK_ORIGIN,
        null,
        HandlerType.OnAssetHistoricalPrice,
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'foo',
          params: {},
        },
      ),
    ).toThrow('Invalid request params');
  });

  it('validates the request params for the OnWebSocketEvent handler', () => {
    expect(() =>
      getHandlerArguments(MOCK_ORIGIN, null, HandlerType.OnWebSocketEvent, {
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
        params: {},
      }),
    ).toThrow('Invalid request params');
  });

  it('throws for invalid handler types', () => {
    expect(() =>
      // @ts-expect-error Invalid handler type.
      getHandlerArguments(MOCK_ORIGIN, null, 'foo', {
        id: 1,
        jsonrpc: '2.0',
        method: 'foo',
        params: {},
      }),
    ).toThrow('Invalid branch reached. Should be detected during compilation.');
  });
});
