const bls = require('noble-bls12-381');

const DATA = 'some random signing data';
const DOMAIN = 2;

const doCalculations = () => {
  (async () => {
    const PRIVATE_KEY = await wallet.request({
      method: 'snap_getAppKey',
    });
    const signature = await bls.sign(DATA, PRIVATE_KEY, DOMAIN);
    console.log('Signature complete', signature);
  })().then(() => setTimeout(doCalculations, 200));
};

doCalculations();
