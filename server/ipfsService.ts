import axios from 'axios';
import FormData from 'form-data';

export async function uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', fileBuffer, fileName);

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
      ...formData.getHeaders(),
    }
  });
  return res.data.IpfsHash; // This is your CID
}
