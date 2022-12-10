'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
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

exports.onRpcRequest = onRpcRequest;
//# sourceMappingURL=snap.js.map
