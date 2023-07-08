import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { bytesToString } from '@metamask/utils';

import loader from './browserify';

describe('loader', () => {
  it('bundles the contents with Browserify', async () => {
    const config = getMockConfig('browserify');

    const source = 'console.log("Hello, world!");';

    const result = (await loader.call(
      // @ts-expect-error - Partial `this` object.
      {
        getOptions: () => config.legacy,
      },
      source,
      undefined,
    )) as Buffer;

    const sourceCode = bytesToString(result);
    expect(sourceCode).toMatchInlineSnapshot(`
      "(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.snap = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
      "use strict";

      console.log("Hello, world!");

      },{}]},{},[1])(1)
      });
      "
    `);
  });

  it('throws if a Browserify error occurs', async () => {
    const config = getMockConfig('browserify');

    const source = 'console.log("Hello, world!";';

    await expect(
      loader.call(
        // @ts-expect-error - Partial `this` object.
        {
          getOptions: () => config.legacy,
        },
        source,
        undefined,
      ),
    ).rejects.toThrow('Unexpected token, expected "," (1:27)');
  });
});
