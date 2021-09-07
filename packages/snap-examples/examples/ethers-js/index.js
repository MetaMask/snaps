/**
 * This example will use its app key as a signing key, and sign anything it is asked to.
 */

const ethers = require('ethers');

/*
 * The `wallet` API is a superset of the standard provider,
 * and can be used to initialize an ethers.js provider like this:
 */
const provider = new ethers.providers.Web3Provider(wallet);

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  console.log('received request', requestObject);
  const privKey = await wallet.getAppKey();
  console.log(`privKey is ${privKey}`);
  const ethWallet = new ethers.Wallet(privKey, provider);
  console.dir(ethWallet);

  switch (requestObject.method) {
    case 'address':
      return ethWallet.address;

    case 'signMessage': {
      const message = requestObject.params[0];
      console.log('trying to sign message', message);
      return ethWallet.signMessage(message);
    }

    case 'sign': {
      const transaction = requestObject.params[0];
      return ethWallet.sign(transaction);
    }

    default:
      throw new Error('Method not found.');
  }
});
