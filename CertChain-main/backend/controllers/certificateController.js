const certificateService = require('../services/certificateService');

class CertificateController {
  async issueCertificate(req, res) {
    try {
      const { certId, studentName, course, ipfsHash } = req.body;

      // Validate required fields
      if (!certId || !studentName || !course || !ipfsHash) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: certId, studentName, course, ipfsHash'
        });
      }

      const result = await certificateService.issueCertificate({
        certId,
        studentName,
        course,
        ipfsHash
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in issueCertificate:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to issue certificate'
      });
    }
  }

  async verifyCertificate(req, res) {
    try {
      const { certId } = req.params;

      if (!certId) {
        return res.status(400).json({
          success: false,
          error: 'Certificate ID is required'
        });
      }

      const certificate = await certificateService.verifyCertificate(certId);

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: 'Certificate not found'
        });
      }

      res.json({
        success: true,
        data: certificate
      });
    } catch (error) {
      console.error('Error in verifyCertificate:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to verify certificate'
      });
    }
  }

  async revokeCertificate(req, res) {
    try {
      const { certId } = req.params;

      if (!certId) {
        return res.status(400).json({
          success: false,
          error: 'Certificate ID is required'
        });
      }

      const result = await certificateService.revokeCertificate(certId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in revokeCertificate:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to revoke certificate'
      });
    }
  }

  async getCertificates(req, res) {
    try {
      const { page = 1, limit = 10, issuer } = req.query;

      const result = await certificateService.getCertificates({
        page: parseInt(page),
        limit: parseInt(limit),
        issuer
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getCertificates:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get certificates'
      });
    }
  }
}

module.exports = new CertificateController();