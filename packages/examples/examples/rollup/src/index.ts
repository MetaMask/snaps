/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
  const ethereum: MetaMaskInpageProvider;
}

const snapId = `local:${window.location.href}`;

const connectButton = document.querySelector('button.connect')!;
const sendInAppButton = document.querySelector('button.sendInApp')!;
const sendNativeButton = document.querySelector('button.sendNative')!;

connectButton.addEventListener('click', connect);
sendInAppButton.addEventListener('click', () => send('inApp'));
sendNativeButton.addEventListener('click', () => send('native'));

// here we get permissions to interact with and install the snap
async function connect() {
  await ethereum.request({
    method: 'wallet_enable',
    params: [
      {
        wallet_snap: { [snapId]: {} },
      },
    ],
  });
}

// here we call the snap's "hello" method
async function send(method: string) {
  try {
    await ethereum.request({
      method: 'wallet_invokeSnap',
      params: [
        snapId,
        {
          method,
        },
      ],
    });
  } catch (err) {
    console.error(err);
    alert(`Problem happened: ${err.message}` || err);
  }
}

export {};
