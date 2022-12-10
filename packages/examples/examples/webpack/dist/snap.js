(() => {
  "use strict";

  var __webpack_require__ = {};

  (() => {
    __webpack_require__.d = (exports, definition) => {
      for (var key in definition) {
        if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key]
          });
        }
      }
    };
  })();

  (() => {
    __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  })();

  (() => {
    __webpack_require__.r = exports => {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, {
          value: 'Module'
        });
      }

      Object.defineProperty(exports, '__esModule', {
        value: true
      });
    };
  })();

  var __webpack_exports__ = {};

  __webpack_require__.r(__webpack_exports__);

  __webpack_require__.d(__webpack_exports__, {
    "onRpcRequest": () => onRpcRequest
  });

  const onRpcRequest = ({
    origin,
    request
  }) => {
    switch (request.method) {
      case 'inApp':
        return wallet.request({
          method: 'snap_notify',
          params: [{
            type: 'inApp',
            message: `Hello, ${origin}!`
          }]
        });

      case 'native':
        return wallet.request({
          method: 'snap_notify',
          params: [{
            type: 'native',
            message: `Hello, ${origin}!`
          }]
        });

      default:
        throw new Error('Method not found.');
    }
  };

  var __webpack_export_target__ = exports;

  for (var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];

  if (__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", {
    value: true
  });
})();
//# sourceMappingURL=snap.js.map