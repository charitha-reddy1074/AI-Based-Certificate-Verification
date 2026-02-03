import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Readable } from 'stream';
import type { Certificate } from '@shared/schema';

export async function generateCertificatePDF(cert: Certificate): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const centerX = pageWidth / 2;

      // Premium background with gradient-like borders
      doc.rect(35, 35, pageWidth - 70, pageHeight - 70)
        .lineWidth(2)
        .strokeColor('#4f46e5');
      
      doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
        .lineWidth(0.5)
        .strokeColor('#818cf8');

      // Decorative corner elements
      const cornerSize = 15;
      doc.strokeColor('#4f46e5').lineWidth(1.5);
      // Top-left corner
      doc.moveTo(60, 60).lineTo(60 + cornerSize, 60);
      doc.moveTo(60, 60).lineTo(60, 60 + cornerSize);
      // Top-right corner
      doc.moveTo(pageWidth - 60, 60).lineTo(pageWidth - 60 - cornerSize, 60);
      doc.moveTo(pageWidth - 60, 60).lineTo(pageWidth - 60, 60 + cornerSize);
      // Bottom-left corner
      doc.moveTo(60, pageHeight - 60).lineTo(60 + cornerSize, pageHeight - 60);
      doc.moveTo(60, pageHeight - 60).lineTo(60, pageHeight - 60 - cornerSize);
      // Bottom-right corner
      doc.moveTo(pageWidth - 60, pageHeight - 60).lineTo(pageWidth - 60 - cornerSize, pageHeight - 60);
      doc.moveTo(pageWidth - 60, pageHeight - 60).lineTo(pageWidth - 60, pageHeight - 60 - cornerSize);
      doc.stroke();

      // Institution Header
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#4f46e5')
        .text(cert.university, { align: 'center' })
        .moveDown(0.3);
      
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('Academic Excellence & Achievement', { align: 'center' })
        .moveDown(0.8);

      // Decorative line
      doc.strokeColor('#818cf8').lineWidth(1);
      doc.moveTo(150, doc.y).lineTo(pageWidth - 150, doc.y).stroke();
      doc.moveDown(0.8);

      // Certificate Title
      doc.fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#1f2937')
        .text('CERTIFICATE', { align: 'center' })
        .moveDown(0.1);
      
      doc.fontSize(14)
        .font('Helvetica')
        .fillColor('#4f46e5')
        .text('OF ACADEMIC ACHIEVEMENT', { align: 'center' })
        .moveDown(1.2);

      // Main certification text
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#374151')
        .text('This Certifies That', { align: 'center' })
        .moveDown(0.5);

      // Student Name - Prominent
      doc.fontSize(32)
        .font('Helvetica-Bold')
        .fillColor('#4f46e5')
        .text(cert.name, { align: 'center' })
        .moveDown(0.3);

      // Decorative underline
      doc.strokeColor('#4f46e5').lineWidth(2);
      doc.moveTo(centerX - 120, doc.y).lineTo(centerX + 120, doc.y).stroke();
      doc.moveDown(0.8);

      // Achievement text
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#374151')
        .text('Has Successfully Completed and Demonstrated Outstanding Achievement in', { align: 'center' })
        .moveDown(0.4);

      doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#4f46e5')
        .text(cert.branch, { align: 'center' })
        .moveDown(0.8);

      // Details Section - Two Column Layout
      const leftCol = 80;
      const rightCol = pageWidth / 2 + 20;
      const detailY = doc.y + 10;

      // Left column
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#4f46e5')
        .text('INSTITUTION', leftCol, detailY, { width: 180 });
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#1f2937')
        .text(cert.university, leftCol, detailY + 15, { width: 180 });

      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#4f46e5')
        .text('DISCIPLINE', leftCol, detailY + 40, { width: 180 });
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#1f2937')
        .text(cert.branch, leftCol, detailY + 55, { width: 180 });

      // Right column
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#4f46e5')
        .text('ROLL NUMBER', rightCol, detailY, { width: 180 });
      doc.fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#2563eb')
        .text(cert.rollNumber, rightCol, detailY + 15, { width: 180 });

      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#4f46e5')
        .text('PERIOD', rightCol, detailY + 40, { width: 180 });
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#1f2937')
        .text(`${cert.joiningYear} - ${cert.passingYear}`, rightCol, detailY + 55, { width: 180 });

      doc.moveDown(5);

      // QR Code and Blockchain Info
      const qrY = doc.y;
      const appBaseUrl = (process.env.PUBLIC_APP_URL || process.env.APP_URL || "https://web-production-32e05.up.railway.app").replace(/\/$/, "");
      const qrData = `${appBaseUrl}/verify/${cert.id}`;
      
      QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 150,
        margin: 1,
      })
        .then((qrUrl: string) => {
          // QR Code section - Left side
          const base64Data = qrUrl.split(',')[1];
          const qrBuffer = Buffer.from(base64Data, 'base64');
          
          doc.fontSize(9)
            .font('Helvetica-Bold')
            .fillColor('#4f46e5')
            .text('VERIFICATION CODE', 80, qrY);
          
          doc.image(qrBuffer, 70, qrY + 15, { width: 120, height: 120 });
          
          doc.fontSize(7)
            .font('Helvetica')
            .fillColor('#6b7280')
            .text(`ID: ${cert.id}`, 70, qrY + 140, { width: 120, align: 'center' });

          // Blockchain Info - Right side
          doc.fontSize(9)
            .font('Helvetica-Bold')
            .fillColor('#4f46e5')
            .text('BLOCKCHAIN VERIFIED', rightCol, qrY, { width: 160 });
          
          doc.fontSize(8)
            .font('Helvetica')
            .fillColor('#1f2937')
            .text('This credential is digitally secured on blockchain technology.', rightCol, qrY + 20, { width: 160 });
          
          if (cert.txHash) {
            doc.fontSize(7)
              .font('Helvetica-Bold')
              .fillColor('#2563eb')
              .text(`TX: ${cert.txHash.substring(0, 20)}...`, rightCol, qrY + 45, { width: 160 });
          }
          
          if (cert.blockHash) {
            doc.fontSize(7)
              .font('Helvetica')
              .fillColor('#6b7280')
              .text(`Block: ${cert.blockHash.substring(0, 20)}...`, rightCol, qrY + 58, { width: 160 });
          }
          
          doc.fontSize(7)
            .fillColor('#059669')
            .text('✓ Permanently Recorded', rightCol, qrY + 71, { width: 160 });

          doc.moveDown(7);

          // Signature section
          const sigY = doc.y;
          
          // Date and Stamp area
          doc.fontSize(10)
            .font('Helvetica')
            .fillColor('#1f2937')
            .text('DATE ISSUED', centerX - 160, sigY, { width: 120, align: 'center' });
          
          const issueDateStr = new Date(cert.createdAt ?? new Date()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          doc.fontSize(11)
            .font('Helvetica-Bold')
            .fillColor('#4f46e5')
            .text(issueDateStr, centerX - 160, sigY + 18, { width: 120, align: 'center' });
          
          // Authorized Signature Area
          doc.fontSize(10)
            .font('Helvetica')
            .fillColor('#1f2937')
            .text('AUTHORIZED BY', centerX + 40, sigY, { width: 120, align: 'center' });
          
          doc.moveTo(centerX + 40, sigY + 30).lineTo(centerX + 160, sigY + 30).stroke();
          
          doc.fontSize(11)
            .font('Helvetica-Bold')
            .fillColor('#4f46e5')
            .text('University Authority', centerX + 40, sigY + 35, { width: 120, align: 'center' });

          // Footer
          doc.moveDown(2);
          doc.fontSize(8)
            .font('Helvetica')
            .fillColor('#6b7280')
            .text('This certificate verifies the academic credentials of the named individual and is recognized as an official record.', {
              align: 'center',
              width: pageWidth - 100
            });
          
          doc.fontSize(7)
            .fillColor('#9ca3af')
            .moveDown(0.3)
            .text(`Generated: ${new Date().toLocaleString()} | Certificate #${cert.id}`, {
              align: 'center'
            });

          doc.end();
        })
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}
