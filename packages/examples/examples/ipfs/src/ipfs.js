const { v4: uuidV4 } = require('uuid');

module.exports.IPFS = class IPFS {
  /**
   * Construct a new instance of the `IPFS` class.
   *
   * @param {object} [provider] - The provider to use.
   * @param {string} [provider.host] - The hostname of the IPFS node.
   * @param {boolean} [provider.pinning] - Whether to pin the data to the IPFS
   * node.
   * @param {string} [provider.port] - The port of the IPFS node.
   * @param {string} [provider.protocol] - The protocol to use, i.e. `http` or
   * `https`.
   * @param {string} [provider.base] - The base URL of the IPFS node.
   */
  constructor(provider) {
    this.setProvider(provider);
  }

  /**
   * Set the provider to use for this IPFS instance.
   *
   * @param {object} [provider] - The provider to use.
   * @param {string} [provider.host] - The hostname of the IPFS node.
   * @param {boolean} [provider.pinning] - Whether to pin the data to the IPFS
   * node.
   * @param {string} [provider.port] - The port of the IPFS node.
   * @param {string} [provider.protocol] - The protocol to use, i.e. `http` or
   * `https`.
   * @param {string} [provider.base] - The base URL of the IPFS node.
   */
  setProvider(provider) {
    this.provider = Object.assign(
      {
        host: '127.0.0.1',
        pinning: true,
        port: '5001',
        protocol: 'http',
        base: '/api/v0',
      },
      provider || {},
    );
    this.requestBase = `${this.provider.protocol}://${this.provider.host}:${this.provider.port}${this.provider.base}`;
  }

  /**
   * Add a file to IPFS.
   *
   * @param {string} inputString - The string to add to IPFS.
   * @returns {Promise<string>} The response from IPFS.
   */
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

  /**
   * Get a file from IPFS.
   *
   * @param {string} ipfsHash - The hash of the file to get.
   * @returns {Promise<string>} The response from IPFS.
   */
  async cat(ipfsHash) {
    return this.send(`${this.requestBase}/cat?arg=${ipfsHash}`, {
      method: 'POST',
    });
  }

  /**
   * Send an HTTP request to the provided `url`.
   *
   * @param {string} url - The URL to send the request to.
   * @param {RequestInit} options - Request options to pass to `fetch`.
   * @returns {Promise<string>} The response text.
   */
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
