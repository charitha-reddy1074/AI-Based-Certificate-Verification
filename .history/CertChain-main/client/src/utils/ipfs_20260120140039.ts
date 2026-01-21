import { Web3Storage } from 'web3.storage';

let web3StorageClient: Web3Storage | null = null;

export const initWeb3Storage = (token: string) => {
  web3StorageClient = new Web3Storage({ token });
};

export const uploadToIPFS = async (file: File): Promise<string> => {
  if (!web3StorageClient) {
    throw new Error('Web3Storage not initialized. Call initWeb3Storage first.');
  }

  try {
    console.log('Uploading file to IPFS...');
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