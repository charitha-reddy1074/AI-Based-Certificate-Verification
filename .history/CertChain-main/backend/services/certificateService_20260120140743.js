const ipfsService = require('./ipfsService');
const blockchainService = require('./blockchainService');

class CertificateService {
  async issueCertificate(certData) {
    try {
      // Validate certificate data
      this.validateCertificateData(certData);

      // Generate unique certificate ID if not provided
      if (!certData.certId) {
        certData.certId = this.generateCertificateId();
      }

      // Upload certificate metadata to IPFS
      const metadata = {
        certId: certData.certId,
        studentName: certData.studentName,
        course: certData.course,
        issuedAt: new Date().toISOString(),
        issuer: certData.issuer || 'University',
      };

      const metadataCid = await ipfsService.uploadJSON(metadata);

      // Issue certificate on blockchain
      const blockchainResult = await blockchainService.issueCertificate({
        ...certData,
        ipfsHash: metadataCid
      }, process.env.UNIVERSITY_PRIVATE_KEY);

      return {
        ...blockchainResult,
        metadataCid,
        certificateUrl: ipfsService.getIPFSUrl(metadataCid),
        metadata
      };
    } catch (error) {
      console.error('Error in certificate issuance:', error);
      throw error;
    }
  }

  async verifyCertificate(certId) {
    try {
      // Get certificate data from blockchain
      const certificate = await blockchainService.verifyCertificate(certId);

      if (!certificate) {
        return null;
      }

      // Get metadata from IPFS
      const metadataUrl = ipfsService.getIPFSUrl(certificate.ipfsHash, 'certificate-metadata.json');

      return {
        ...certificate,
        certId,
        metadataUrl,
        certificateUrl: ipfsService.getIPFSUrl(certificate.ipfsHash),
        issuedDate: new Date(certificate.issuedAt * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error in certificate verification:', error);
      throw error;
    }
  }

  async revokeCertificate(certId) {
    try {
      const result = await blockchainService.revokeCertificate(
        certId,
        process.env.UNIVERSITY_PRIVATE_KEY
      );

      return result;
    } catch (error) {
      console.error('Error in certificate revocation:', error);
      throw error;
    }
  }

  async getCertificates(filters = {}) {
    try {
      const { page = 1, limit = 10, issuer } = filters;

      // Get certificates from blockchain
      const result = await blockchainService.getCertificatesByIssuer(issuer, page, limit);

      // Enrich with IPFS data
      const enrichedCertificates = await Promise.all(
        result.certificates.map(async (cert) => {
          try {
            const metadataUrl = ipfsService.getIPFSUrl(cert.ipfsHash, 'certificate-metadata.json');
            return {
              ...cert,
              metadataUrl,
              certificateUrl: ipfsService.getIPFSUrl(cert.ipfsHash)
            };
          } catch (error) {
            console.error('Error enriching certificate:', error);
            return cert;
          }
        })
      );

      return {
        ...result,
        certificates: enrichedCertificates
      };
    } catch (error) {
      console.error('Error getting certificates:', error);
      throw error;
    }
  }

  validateCertificateData(data) {
    const required = ['studentName', 'course'];
    const missing = required.filter(field => !data[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (data.certId && !/^CERT\d{6}$/.test(data.certId)) {
      throw new Error('Certificate ID must be in format CERT followed by 6 digits');
    }
  }

  generateCertificateId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CERT${timestamp}${random}`;
  }

  async uploadCertificateFile(fileBuffer, filename) {
    try {
      const result = await ipfsService.uploadFile(fileBuffer, filename);
      return result;
    } catch (error) {
      console.error('Error uploading certificate file:', error);
      throw error;
    }
  }
}

module.exports = new CertificateService();