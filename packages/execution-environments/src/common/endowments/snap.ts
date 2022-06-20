import { BIP44CoinTypeNode, JsonBIP44CoinTypeNode } from '@metamask/key-tree';
import slip44 from '@metamask/slip44';
import {
  SnapCrypto,
  SnapMetamask,
  SnapProvider,
  SnapStorage,
} from '@metamask/snap-types';

type Slip44Data = {
  index: string;
  hex: string;
  symbol: string;
  name: string;
  link?: string;
};

const symbolToCoin = new Map<string, Slip44Data>(
  Object.values(slip44)
    .filter((coin) => /^[a-zA-Z]+$/.test(coin.symbol))
    .map((coin) => [coin.symbol, coin]),
);

const createSnap = ({ ethereum }: { ethereum: SnapProvider }) => {
  /**
   * API inspired by https://developer.chrome.com/docs/extensions/reference/storage/
   */
  const storage: SnapStorage = new (class implements SnapStorage {
    async clear(): Promise<void> {
      await ethereum.request({ method: 'snap_manageState', params: ['clear'] });
    }

    async get(
      keys?: string | string[] | Record<string, unknown> | null,
    ): Promise<Record<string, any>> {
      let data: Record<string, null | { default: unknown }> | null;

      if (typeof keys === 'string') {
        data = { [keys]: null };
      } else if (Array.isArray(keys)) {
        data = {};
        keys.forEach((key) => {
          data![key] = null;
        });
      } else if (typeof keys === 'object' && keys !== null) {
        data = {};
        Object.keys(keys).forEach((key) => {
          data![key] = { default: keys[key] };
        });
      } else if (keys === null || keys === undefined) {
        data = null;
      } else {
        throw new TypeError('Unexpected Storage.get parameter type');
      }

      const state: Record<string, any> =
        (await ethereum.request({
          method: 'snap_manageState',
          params: ['get'],
        })) ?? {};

      if (data === null) {
        return state;
      }
      const result: Record<string, any> = {};
      Object.keys(data).forEach((key) => {
        if (key in state) {
          result[key] = state[key];
        } else if (data![key] !== null) {
          result[key] = data![key]?.default;
        }
      });
      return result;
    }

    async remove(keys: string | string[]): Promise<void> {
      let data: string[];
      if (typeof keys === 'string') {
        data = [keys];
      } else if (Array.isArray(keys)) {
        data = keys;
      } else {
        throw new TypeError('Unexpected Storage.remove parameter type');
      }

      await ethereum.request({
        method: 'snap_manageState',
        params: ['remove', data],
      });
    }

    async set(keys: Record<string, unknown>): Promise<void> {
      await ethereum.request({
        method: 'snap_manageState',
        params: ['set', keys],
      });
    }
  })();

  const metamask: SnapMetamask = new (class implements SnapMetamask {
    async userConfirmation(params: {
      title: string;
      description?: string | undefined;
      content?: string | undefined;
    }): Promise<boolean> {
      return (await ethereum.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: params.title,
            description: params.description,
            textAreaContent: params.content,
          },
        ],
      })) as boolean;
    }
  })();

  const crypto: SnapCrypto = new (class implements SnapCrypto {
    async appKey(): Promise<string> {
      return (await ethereum.request({ method: 'snap_getAppKey' })) as string;
    }

    bip44 = {
      async get(coinOrSymbol: string | number): Promise<BIP44CoinTypeNode> {
        if (typeof coinOrSymbol === 'string') {
          const coinType = symbolToCoin.get(coinOrSymbol);
          if (coinType === undefined) {
            throw new TypeError(`Unknown symbol "${coinOrSymbol}" for slip44`);
          }
          coinOrSymbol = Number(coinType.index);
        }
        const jsonNode: JsonBIP44CoinTypeNode = (await ethereum.request({
          method: `snap_getBip44Entropy_${coinOrSymbol}`,
        })) as JsonBIP44CoinTypeNode;
        return BIP44CoinTypeNode.fromJSON(jsonNode, jsonNode.coin_type);
      },
    };
  })();

  return {
    snap: {
      ethereum,
      storage,
      metamask,
      crypto,
    },
  };
};

const endowmentModule = {
  names: [
    'snap:storage',
    'snap:ethereum',
    'snap:metamask',
    'snap:crypto',
  ] as const,
  factory: createSnap,
};
export default endowmentModule;
