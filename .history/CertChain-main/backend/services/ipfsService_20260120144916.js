const { Web3Storage } = require('web3.storage');

class IPFSService {
  constructor() {
    this.web3Storage = null;
    this.token = null;
  }

  initWeb3Storage() {
    if (!this.token) {
      this.token = process.env.WEB3_STORAGE_TOKEN;
    }

    if (!this.token) {
      throw new Error('Web3.Storage token not configured. Please set WEB3_STORAGE_TOKEN in your environment variables.');
    }

    if (!this.web3Storage) {
      this.web3Storage = new Web3Storage({ token: this.token });
    }

    return this.web3Storage;
  }

  async uploadFile(fileBuffer, filename) {
    if (!this.web3Storage) {
      this.initWeb3Storage();
    }

    try {
      console.log('Uploading file to IPFS...', filename);

      // Create a File object from buffer
      const file = new File([fileBuffer], filename);

      const cid = await this.web3Storage.put([file], {
        name: filename,
        maxRetries: 3,
      });

      const ipfsUrl = `https://${cid}.ipfs.w3s.link/${filename}`;
      console.log('File uploaded to IPFS:', ipfsUrl);

      return {
        cid,
        url: ipfsUrl,
        filename
      };
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async uploadJSON(data) {
    if (!this.web3Storage) {
      this.initWeb3Storage();
    }

    try {
      console.log('Uploading JSON to IPFS...');

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], 'certificate-metadata.json');

      const cid = await this.web3Storage.put([file], {
        name: 'certificate-metadata.json',
        maxRetries: 3,
      });

      console.log('JSON uploaded to IPFS:', cid);
      return cid;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  getIPFSUrl(cid, filename) {
    if (filename) {
      return `https://${cid}.ipfs.w3s.link/${filename}`;
    }
    return `https://${cid}.ipfs.w3s.link`;
  }

  getGatewayUrl(cid, filename) {
    // Alternative IPFS gateway
    if (filename) {
      return `https://gateway.ipfs.io/ipfs/${cid}/${filename}`;
    }
    return `https://gateway.ipfs.io/ipfs/${cid}`;
  }
}

module.exports = new IPFSService();