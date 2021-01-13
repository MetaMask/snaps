const { ethErrors } = require('eth-json-rpc-errors')

const accounts = [];
updateUi();

wallet.registerRpcMessageHandler(async (_origin, req) => {
  switch (req.method) {
    case 'addAccount':
      addAccount(req.params);
      break;

    default:
      throw ethErrors.rpc.methodNotFound({ data: req })
  }

  updateUi();
  return true
})

/**
 * This is purely for demonstration purposes.
 * In this handler, _you_ decide what calling these methods on an account
 * managed by your plugin means.
 * For instance, you could sign something using custom cryptography and
 * an app key using wallet.getAppKey().
 * 
 * All methods below simply open the custom prompt window, which you
 * can customize!
 */
wallet.registerAccountMessageHandler(async (origin, req) => {
  switch (req.method) {
    case 'eth_sign':
    case 'eth_signTransaction':
    case 'personal_sign':
    case 'wallet_signTypedData':
    case 'wallet_signTypedData_v3':
    case 'wallet_signTypedData_v4':
      const result = await prompt({ html: `<div style="width: 100%;overflow-wrap: break-word;">
        The site from <span style="font-weight: 900;color: #037DD6;"><a href="${origin}">${origin}</a></span> requests you sign this with your offline strategy:\n${JSON.stringify(req)}
        </div>`})
      return result
    default:
      throw ethErrors.rpc.methodNotFound({ data: req })
  }
})

async function addAccount (params) {
  validate(params);
  const account = params[0]
  const approved = await confirm(`Do you want to add read-only account ${account} to your wallet?`)
  if (!approved) {
    throw ethErrors.provider.userRejectedRequest({ data: params })
  }
  accounts.push(account);
  updateUi();
}

function validate (params) {
  if (params.length !== 1 || typeof params[0] !== 'string') {
    throw ethErrors.rpc.invalidParams({ data: params })
  }
}

async function confirm (message) {
  const result = await wallet.request({ method: 'confirm', params: [message] });
  return result;
}

async function prompt (message) {
  const result = await wallet.request({ method: 'customPrompt', params: [message] });
  return result;
}

function updateUi () {
  console.log('updating UI with accounts', accounts)
  accounts.forEach(async (account) => {
    console.log('issuing add for ', account)
    wallet.request({
      method: 'wallet_manageIdentities',
      params: [ 'add', { address: account }],
    })
    .catch((err) => console.log('Problem updating identity', err))
    .then((result) => {
      console.log('adding identity seems to have succeeded!')
    })
  })
}

