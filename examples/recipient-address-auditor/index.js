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
