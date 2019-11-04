() => (
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9yZWNpcGllbnQtYWRkcmVzcy1hdWRpdG9yL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImZ1bmN0aW9uIG1vY2tBdWRpdEFwaSAoYWRkcmVzcykge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgY29uc3QgbGFzdERpZ2l0ID0gYWRkcmVzcy5zbGljZShhZGRyZXNzLmxlbmd0aCAtIDEpXG4gICAgcmVzb2x2ZShCb29sZWFuKGxhc3REaWdpdC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9bYS1mXS8pKSlcbiAgfSlcbn1cblxud2FsbGV0Lm9uTWV0YU1hc2tFdmVudCgnbmV3VW5hcHByb3ZlZFR4JywgYXN5bmMgKHR4TWV0YSkgPT4ge1xuICBjb25zdCB7IHR4UGFyYW1zIH0gPSB0eE1ldGFcbiAgY29uc3QgYWRkcmVzc0lzVW50cnVzdHdvcnRoeSA9IGF3YWl0IG1vY2tBdWRpdEFwaSh0eFBhcmFtcy50bylcbiAgd2FsbGV0LmFkZEFkZHJlc3NBdWRpdCh7XG4gICAgYWRkcmVzczogdHhQYXJhbXMudG8sXG4gICAgYXVkaXRvcjogJ0F3ZXNvbWUgQXVkaXRzJyxcbiAgICBzdGF0dXM6IGFkZHJlc3NJc1VudHJ1c3R3b3J0aHkgPyAnd2FybmluZycgOiAnYXBwcm92YWwnLFxuICAgIG1lc3NhZ2U6IGFkZHJlc3NJc1VudHJ1c3R3b3J0aHlcbiAgICAgID8gJ1RoZSByZWNpcGllbnQgb2YgdGhpcyB0cmFuc2FjdGlvbiBpcyB1bnRydXN0d29ydGh5J1xuICAgICAgOiAnVGhlIHJlY2lwaWVudCBvZiB0aGlzIHRyYW5zYWN0aW9uIGlzIHRydXN0d29ydGh5JyxcbiAgfSlcbn0pXG4iXX0=
)