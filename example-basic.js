(() => {

  function update3Box ({ type, box }, newState) {
    console.log('3boxbasic update3Box type:', type);
    console.log('3boxbasic update3Box newState:', newState);
    return box.private.set(type, JSON.stringify(newState));
  }

  function registerUpdates (box) {
    const updatePreferences = update3Box.bind(this, { type: 'preferences', box });
    console.log('3boxbasic registerUpdates:', `updatePreferences:${updatePreferences} box:${box}`);
    pluginAPIs.subscribeToPreferencesControllerChanges(updatePreferences);
  }

  function restoreFrom3Box (box, address) {
    box.private.get('preferences')
      .then(backedUpPreferences => {
        console.log('backedUpPreferences', backedUpPreferences)
        backedUpPreferences && pluginAPIs.updatePreferencesControllerState(JSON.parse(backedUpPreferences));
        registerUpdates(box);
        console.log('3boxbasic restoreFrom3Box:', `address:${address} box:${box} backedUpPreferences:${backedUpPreferences}`);
        pluginAPIs.updatePluginState({ syncDone3Box: true, threeBoxAddress: address });
      })
  }

  function new3Box (address) {
    pluginAPIs.updatePluginState({ syncDone3Box: false });
    console.log('3boxbasic new3Box 1:', `address:${address}`);
    pluginAPIs.generateSignature('This app wants to view and update your 3Box profile.', address)
      .then(signature => pluginAPIs.Box.openBox(
        address,
        ethereumProvider,
        {
          walletProvidedSignature: signature
        }
      ))
      .then(box => {
        box.onSyncDone(() => {
          restoreFrom3Box(box, address);
          console.log('3boxbasic new3Box 2:', `address:${address} box:${box}`);
          pluginAPIs.updatePluginState({ syncDone3Box: true, threeBoxAddress: address });
        })
      })
  }

  function metaPlugin () {
    new3Box(pluginData.address)
  }

  metaPlugin()

})
