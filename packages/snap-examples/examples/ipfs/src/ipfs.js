const { v4: uuidV4 } = require('uuid');

module.exports.IPFS = class IPFS {
  constructor(provider) {
    this.setProvider(provider);
  }

  setProvider(provider) {
    this.provider = Object.assign(
      {
        host: '127.0.01',
        pinning: true,
        port: '5001',
        protocol: 'http',
        base: '/api/v0',
      },
      provider || {},
    );
    this.requestBase = `${this.provider.protocol}://${this.provider.host}:${this.provider.port}${this.provider.base}`;
  }

  async add(inputString) {
    const boundary = uuidV4();
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="input"\r\nContent-Type: application/octet-stream\r\n\r\n${inputString}\r\n--${boundary}--`;

    return this.send(`${this.requestBase}/add?pin=${this.provider.pinning}`, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
    });
  }

  async cat(ipfsHash) {
    return this.send(`${this.requestBase}/cat?arg=${ipfsHash}`, {
      method: 'POST',
    });
  }

  async send(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(
        `IPFS api call failed, status ${response.status}: ${response.statusText}`,
      );
    }
    return response.text();
  }
};
