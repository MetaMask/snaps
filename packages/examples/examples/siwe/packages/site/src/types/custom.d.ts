/* eslint-disable*/

/// <reference types="react-scripts" />

import { MetaMaskInpageProvider } from '@metamask/providers';
/*
 * Window type extension to support ethereum
 */

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}
