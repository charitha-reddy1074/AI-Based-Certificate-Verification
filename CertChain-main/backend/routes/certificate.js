const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// Certificate routes
router.post('/issue', certificateController.issueCertificate);
router.get('/verify/:certId', certificateController.verifyCertificate);
router.post('/revoke/:certId', certificateController.revokeCertificate);
router.get('/list', certificateController.getCertificates);

module.exports = router;