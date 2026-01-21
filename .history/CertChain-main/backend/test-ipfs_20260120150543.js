const IPFSService = require('./services/ipfsService');

async function testIPFS() {
  try {
    console.log('Testing IPFS service...');

    // Test JSON upload
    const testData = {
      name: 'Test Certificate',
      issuer: 'Test University',
      recipient: 'John Doe',
      timestamp: new Date().toISOString()
    };

    console.log('Uploading test JSON...');
    const cid = await IPFSService.uploadJSON(testData);
    console.log('✅ JSON uploaded successfully. CID:', cid);

    // Test getting URL
    const url = IPFSService.getIPFSUrl(cid);
    console.log('✅ IPFS URL:', url);

    console.log('🎉 IPFS service test completed successfully!');

  } catch (error) {
    console.error('❌ IPFS service test failed:', error.message);
  }
}

testIPFS();