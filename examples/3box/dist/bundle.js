(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

// const plug = require('./src/3box-example')
// const plug = require('./src/example1')
var plug = require('./src/3box-example-basic');

},{"./src/3box-example-basic":2}],2:[function(require,module,exports){
"use strict";

(function () {
  function update3Box(_ref, newState) {
    var type = _ref.type,
        box = _ref.box;
    console.log('3boxbasic update3Box type:', type);
    console.log('3boxbasic update3Box newState:', newState);
    return box["private"].set(type, JSON.stringify(newState));
  }

  function registerUpdates(box) {
    var updatePreferences = update3Box.bind(this, {
      type: 'preferences',
      box: box
    });
    console.log('3boxbasic registerUpdates:', "updatePreferences:".concat(updatePreferences, " box:").concat(box));
    pluginAPIs.subscribeToPreferencesControllerChanges(updatePreferences);
  }

  function restoreFrom3Box(box, address) {
    box["private"].get('preferences').then(function (backedUpPreferences) {
      console.log('backedUpPreferences', backedUpPreferences);
      backedUpPreferences && pluginAPIs.updatePreferencesControllerState(JSON.parse(backedUpPreferences));
      registerUpdates(box);
      console.log('3boxbasic restoreFrom3Box:', "address:".concat(address, " box:").concat(box, " backedUpPreferences:").concat(backedUpPreferences));
      pluginAPIs.updatePluginState({
        syncDone3Box: true,
        threeBoxAddress: address
      });
    });
  }

  function new3Box(address) {
    pluginAPIs.updatePluginState({
      syncDone3Box: false
    });
    console.log('3boxbasic new3Box 1:', "address:".concat(address));
    pluginAPIs.generateSignature('This app wants to view and update your 3Box profile.', address).then(function (signature) {
      return pluginAPIs.Box.openBox(address, ethereumProvider, {
        walletProvidedSignature: signature
      });
    }).then(function (box) {
      box.onSyncDone(function () {
        restoreFrom3Box(box, address);
        console.log('3boxbasic new3Box 2:', "address:".concat(address, " box:").concat(box));
        pluginAPIs.updatePluginState({
          syncDone3Box: true,
          threeBoxAddress: address
        });
      });
    });
  }

  function metaPlugin() {
    new3Box(pluginData.address);
  }

  metaPlugin();
});

},{}]},{},[1]);