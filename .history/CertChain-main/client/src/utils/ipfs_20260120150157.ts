import { WEB3_STORAGE_TOKEN } from './constants';

export const initWeb3Storage = () => {
  if (!WEB3_STORAGE_TOKEN) {
    throw new Error('IPFS token not configured. Please set REACT_APP_WEB3_STORAGE_TOKEN in your environment variables.');
  }
  return true;
};

export const uploadToIPFS = async (file: File): Promise<string> => {
  const token = WEB3_STORAGE_TOKEN;
  if (!token) {
    throw new Error('IPFS token not configured.');
  }

  try {
    console.log('Uploading file to IPFS...', file.name);

    const formData = new FormData();
    formData.append('file', file);

    // Try web3.storage API first (works with both web3.storage and NFT.Storage tokens)
    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // If web3.storage fails, try NFT.Storage API
      console.log('web3.storage upload failed, trying NFT.Storage...');
      const nftResponse = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!nftResponse.ok) {
        throw new Error(`Both APIs failed. web3.storage: ${response.status}, NFT.Storage: ${nftResponse.status}`);
      }

      const result = await nftResponse.json();
      const cid = result.value.cid || result.cid;
      const ipfsUrl = `https://${cid}.ipfs.nftstorage.link/${file.name}`;
      console.log('File uploaded to NFT.Storage:', ipfsUrl);
      return cid;
    }

    const result = await response.json();
    const cid = result.cid;
    const ipfsUrl = `https://${cid}.ipfs.w3s.link/${file.name}`;
    console.log('File uploaded to IPFS:', ipfsUrl);

    return cid;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

export const uploadJSONToIPFS = async (data: any): Promise<string> => {
  const token = WEB3_STORAGE_TOKEN;
  if (!token) {
    throw new Error('IPFS token not configured.');
  }

  try {
    console.log('Uploading JSON to IPFS...');

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'certificate-metadata.json');

    const formData = new FormData();
    formData.append('file', file);

    // Try web3.storage API first
    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // If web3.storage fails, try NFT.Storage API
      console.log('web3.storage upload failed, trying NFT.Storage...');
      const nftResponse = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!nftResponse.ok) {
        throw new Error(`Both APIs failed. web3.storage: ${response.status}, NFT.Storage: ${nftResponse.status}`);
      }

      const result = await nftResponse.json();
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
};

export const getIPFSUrl = (cid: string, filename?: string): string => {
  if (filename) {
    return `https://${cid}.ipfs.w3s.link/${filename}`;
  }
  return `https://${cid}.ipfs.w3s.link`;
};

export const getIPFSGatewayUrl = (cid: string, filename?: string): string => {
  // Alternative IPFS gateway for better reliability
  if (filename) {
    return `https://gateway.ipfs.io/ipfs/${cid}/${filename}`;
  }
  return `https://gateway.ipfs.io/ipfs/${cid}`;
};