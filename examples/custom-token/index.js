const { errors: rpcErrors } = require('eth-json-rpc-errors')

let userBalance = 0;
let created = false;

let asset = {
  symbol: 'CUSTOM',
  balance: userBalance.toString(),
  identifier: 'this-plugins-only-asset',
  image: 'https://placekitten.com/200/200',
  decimals: 0,
  customViewUrl: 'http://localhost:8085/index.html'
}

updateUi();

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  switch (requestObject.method) {
    case 'getBalance':
      return userBalance;
    case 'mint':
      userBalance += (requestObject.params[0] || 1);
      updateUi();
      return userBalance;
    case 'burn':
      userBalance -= (requestObject.params[0] || userBalance);
      updateUi();
      return userBalance;
    default:
      throw rpcErrors.methodNotFound(requestObject)
  }
})

function updateUi () {
  asset.balance = String(userBalance);
  let method = created ? 'updateAsset' : 'addAsset';

  // addAsset will update if identifier matches.
  wallet.send({
    method: 'wallet_manageAssets',
    params: [ method, asset ],
  })

  created = true
}

