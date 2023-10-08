import type { MetaMaskInpageProvider } from '@metamask/providers';
import type { SnapsGlobalObject } from '@metamask/rpc-methods';
declare global {
    const ethereum: MetaMaskInpageProvider;
    const snap: SnapsGlobalObject;
}
