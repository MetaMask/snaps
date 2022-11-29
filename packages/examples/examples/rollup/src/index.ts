/* eslint-disable @typescript-eslint/no-non-null-assertion */

const snapId = `local:${window.location.href}`;

const connectButton = document.querySelector('button.connect')!;
const sendInAppButton = document.querySelector('button.sendInApp')!;
const sendNativeButton = document.querySelector('button.sendNative')!;

connectButton.addEventListener('click', () => {
  connect().catch(console.error);
});

sendInAppButton.addEventListener('click', () => {
  send('inApp').catch(console.error);
});

sendNativeButton.addEventListener('click', () => {
  send('native').catch(console.error);
});

/**
 * Get permission to interact with and install the snap.
 */
async function connect() {
  await ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: {},
    },
  });
}

/**
 * Call the snap's `inApp` or `native` method. This function triggers an alert
 * if the call failed.
 *
 * @param method - The method to call. Must be one of `inApp` or `native`.
 */
async function send(method: 'inApp' | 'native') {
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
  } catch (error) {
    console.error(error);

    // eslint-disable-next-line no-alert
    alert(`Problem happened: ${error.message}` ?? error);
  }
}

export {};
