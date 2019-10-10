() => (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function mockAuditApi (address) {
  return new Promise(resolve => {
    const lastDigit = address.slice(address.length - 1)
    resolve(Boolean(lastDigit.toLowerCase().match(/[a-f]/)))
  })
}

wallet.onMetaMaskEvent('newUnapprovedTx', async (txMeta) => {
  const { txParams } = txMeta
  const addressIsUntrustworthy = await mockAuditApi(txParams.to)
  wallet.addAddressAudit({
    address: txParams.to,
    auditor: 'Awesome Audits',
    status: addressIsUntrustworthy ? 'warning' : 'approval',
    message: addressIsUntrustworthy
      ? 'The recipient of this transaction is untrustworthy'
      : 'The recipient of this transaction is trustworthy',
  })
})

},{}]},{},[1])