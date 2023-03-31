/* eslint-disable */
// This file is used for the E2E eval test.

(function (f) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = f();
  } else if (typeof define === 'function' && define.amd) {
    define([], f);
  } else {
    let g;
    if (typeof window !== 'undefined') {
      g = window;
    } else if (typeof global !== 'undefined') {
      g = global;
    } else if (typeof self !== 'undefined') {
      g = self;
    } else {
      g = this;
    }
    g.snap = f();
  }
})(function () {
  let define, module, exports;
  return (function () {
    /**
     *
     * @param e
     * @param n
     * @param t
     */
    function r(e, n, t) {
      /**
       *
       * @param i
       * @param f
       */
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            const c = typeof require === 'function' && require;
            if (!f && c) {
              return c(i, !0);
            }
            if (u) {
              return u(i, !0);
            }
            const a = new Error(`Cannot find module '${i}'`);
            throw ((a.code = 'MODULE_NOT_FOUND'), a);
          }
          const p = (n[i] = {
            exports: {},
          });
          e[i][0].call(
            p.exports,
            function (r) {
              const n = e[i][1][r];
              return o(n || r);
            },
            p,
            p.exports,
            r,
            e,
            n,
            t,
          );
        }
        return n[i].exports;
      }
      for (
        var u = typeof require === 'function' && require, i = 0;
        i < t.length;
        i++
      ) {
        o(t[i]);
      }
      return o;
    }
    return r;
  })()(
    {
      1: [
        function (require, module, exports) {
          'use strict';

          Object.defineProperty(exports, '__esModule', {
            value: true,
          });
          exports.onRpcRequest = void 0;
          const _message = require('./message');
          const onRpcRequest = async ({ origin, request }) => {
            switch (request.method) {
              case 'hello':
                return await snap.request({
                  method: 'snap_notify',
                  params: {
                    type: 'inapp',
                    message: (0, _message.getMessage)(origin),
                  },
                });
              default:
                throw new Error('Method not found.');
            }
          };
          exports.onRpcRequest = onRpcRequest;
        },
        {
          './message': 2,
        },
      ],
      2: [
        function (require, module, exports) {
          'use strict';

          Object.defineProperty(exports, '__esModule', {
            value: true,
          });
          exports.getMessage = void 0;
          const getMessage = (originString) => `Hello, ${originString}!`;
          exports.getMessage = getMessage;
        },
        {},
      ],
    },
    {},
    [1],
  )(1);
});
