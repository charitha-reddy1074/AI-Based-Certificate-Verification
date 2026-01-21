import { Web3Storage } from 'web3.storage';
import { WEB3_STORAGE_TOKEN } from './constants';

let web3StorageClient: Web3Storage | null = null;

export const initWeb3Storage = () => {
  if (!WEB3_STORAGE_TOKEN) {
    throw new Error('Web3.Storage token not configured. Please set REACT_APP_WEB3_STORAGE_TOKEN in your environment variables.');
  }

  web3StorageClient = new Web3Storage({ token: WEB3_STORAGE_TOKEN });
};

export const uploadToIPFS = async (file: File): Promise<string> => {
  if (!web3StorageClient) {
    initWeb3Storage();
  }

  if (!web3StorageClient) {
    throw new Error('Web3Storage not initialized. Call initWeb3Storage first.');
  }

  try {
    console.log('Uploading file to IPFS...', file.name);
    const cid = await web3StorageClient.put([file], {
      name: file.name,
      maxRetries: 3,
    });

    const ipfsUrl = `https://${cid}.ipfs.w3s.link/${file.name}`;
    console.log('File uploaded to IPFS:', ipfsUrl);

    return cid;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

export const uploadJSONToIPFS = async (data: any): Promise<string> => {
  if (!web3StorageClient) {
    initWeb3Storage();
  }

  if (!web3StorageClient) {
    throw new Error('Web3Storage not initialized. Call initWeb3Storage first.');
  }

  try {
    console.log('Uploading JSON to IPFS...');
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'certificate-metadata.json');

    const cid = await web3StorageClient.put([file], {
      name: 'certificate-metadata.json',
      maxRetries: 3,
    });

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