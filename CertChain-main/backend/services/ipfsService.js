const fetch = require('node-fetch');
const FormData = require('form-data');
require('dotenv').config();

class IPFSService {
  constructor() {
    this.token = null;
  }

  initWeb3Storage() {
    if (!this.token) {
      this.token = process.env.WEB3_STORAGE_TOKEN;
    }

    if (!this.token) {
      throw new Error('Web3.Storage token not configured. Please set WEB3_STORAGE_TOKEN in your environment variables.');
    }

    return true;
  }

  async uploadFile(fileBuffer, filename) {
    if (!this.token) {
      this.initWeb3Storage();
    }

    try {
      console.log('Uploading file to IPFS...', filename);

      const formData = new FormData();
      formData.append('file', fileBuffer, { filename });

      // Try web3.storage API first (works with both web3.storage and NFT.Storage tokens)
      let response = await fetch('https://api.web3.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        // If web3.storage fails, try NFT.Storage API
        console.log('web3.storage upload failed, trying NFT.Storage...');
        response = await fetch('https://api.nft.storage/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Both APIs failed. web3.storage: ${response.status}, NFT.Storage: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        const cid = result.value.cid || result.cid;
        const ipfsUrl = `https://${cid}.ipfs.nftstorage.link/${filename}`;
        console.log('File uploaded to NFT.Storage:', ipfsUrl);

        return {
          cid,
          url: ipfsUrl,
          filename
        };
      }

      const result = await response.json();
      const cid = result.cid;
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
    if (!this.token) {
      this.initWeb3Storage();
    }

    try {
      console.log('Uploading JSON to IPFS...');

      const jsonString = JSON.stringify(data, null, 2);
      const formData = new FormData();
      formData.append('file', Buffer.from(jsonString), {
        filename: 'certificate-metadata.json',
        contentType: 'application/json'
      });

      // Try web3.storage API first
      let response = await fetch('https://api.web3.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        // If web3.storage fails, try NFT.Storage API
        console.log('web3.storage upload failed, trying NFT.Storage...');
        response = await fetch('https://api.nft.storage/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Both APIs failed. web3.storage: ${response.status}, NFT.Storage: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        const cid = result.value.cid || result.cid;
        console.log('JSON uploaded to NFT.Storage:', cid);
        return cid;
      }

      const result = await response.json();
      const cid = result.cid;
      console.log('JSON uploaded to IPFS:', cid);
      return cid;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  getIPFSUrl(cid, filename) {
    // Use web3.storage gateway as primary
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