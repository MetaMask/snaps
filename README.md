Usage:

To create a json file that can be served to metamask as a plugin manifest:

```
npm install
touch new-plugin.js
npm run bundle-plugin-basic -- new-plugin.js
```

Input:
```
// new-plugin.js

(() => {
  pluginAPIs.onNewTx(txMeta => {
    console.log('txMeta in plugin',txMeta);
    pluginAPIs.fetch('http://localhost:8081/plugin123.json')
      .then(r => r.json())
      .then(result => pluginAPIs.updatePluginState({  [txMeta.txParams.to]: Math.random() > 0.5 }));
  })
})
```

Output:
```
// basic-bundle.json
{
  "source": "(function () {pluginAPIs.onNewTx(txMeta => {console.log('txMeta in plugin', txMeta);pluginAPIs.fetch('http://localhost:8081/plugin123.json').then(r => r.json()).then(result => pluginAPIs.updatePluginState({  [txMeta.txParams.to]: Math.random() > 0.5 }));})})",
  "requestedAPIs": ["onNewTx", "fetch", "updatePluginState"]
}
```