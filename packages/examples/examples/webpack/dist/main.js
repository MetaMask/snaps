/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const snapId = `local:${window.location.href}`;
const connectButton = document.querySelector('button.connect');
const sendInAppButton = document.querySelector('button.sendInApp');
const sendNativeButton = document.querySelector('button.sendNative');
connectButton.addEventListener('click', connect);
sendInAppButton.addEventListener('click', () => send('inApp'));
sendNativeButton.addEventListener('click', () => send('native'));
/**
 * Get permission to interact with and install the snap.
 */

async function connect() {
  await ethereum.request({
    method: 'wallet_enable',
    params: [{
      wallet_snap: {
        [snapId]: {}
      }
    }]
  });
}
/**
 * Call the snap's `inApp` or `native` method. This function triggers an alert
 * if the call failed.
 *
 * @param method - The method to call. Must be one of `inApp` or `native`.
 */


async function send(method) {
  try {
    await ethereum.request({
      method: 'wallet_invokeSnap',
      params: [snapId, {
        method
      }]
    });
  } catch (err) {
    console.error(err);
    alert(`Problem happened: ${err.message}` || err);
  }
}


/******/ })()
;
//# sourceMappingURL=main.js.map