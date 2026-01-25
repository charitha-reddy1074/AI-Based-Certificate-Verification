import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Readable } from 'stream';
import type { Certificate } from '@shared/schema';

export async function generateCertificatePDF(cert: Certificate): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Background gradient effect with borders
      doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100)
        .stroke('#4f46e5');

      // Header
      doc.fontSize(32)
        .font('Helvetica-Bold')
        .text('CERTIFICATE', { align: 'center' })
        .fontSize(14)
        .font('Helvetica')
        .text('OF ACADEMIC CREDENTIAL', { align: 'center' })
        .moveDown(1);

      doc.strokeColor('#4f46e5')
        .moveTo(150, doc.y)
        .lineTo(doc.page.width - 150, doc.y)
        .stroke();

      // Main content
      doc.moveDown(1)
        .fontSize(12)
        .font('Helvetica')
        .text('This is to certify that', { align: 'center' })
        .moveDown(0.5)
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(cert.name, { align: 'center', underline: true })
        .moveDown(0.5)
        .fontSize(12)
        .font('Helvetica')
        .text('has successfully completed their academic program', { align: 'center' })
        .moveDown(1);

      // Certificate Details
      const tableY = doc.y + 20;
      const leftCol = 80;
      const rightCol = doc.page.width / 2;

      // Left column details
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('Institution:', leftCol, tableY);
      doc.font('Helvetica')
        .text(cert.university, leftCol, tableY + 20, { width: 200 });

      doc.font('Helvetica-Bold')
        .text('Branch:', leftCol, tableY + 50);
      doc.font('Helvetica')
        .text(cert.branch, leftCol, tableY + 70, { width: 200 });

      doc.font('Helvetica-Bold')
        .text('Duration:', leftCol, tableY + 100);
      doc.font('Helvetica')
        .text(`${cert.joiningYear} - ${cert.passingYear}`, leftCol, tableY + 120);

      // Right column details
      doc.font('Helvetica-Bold')
        .text('Roll Number:', rightCol, tableY);
      doc.font('Helvetica')
        .text(cert.rollNumber, rightCol, tableY + 20, { width: 200 });

      doc.font('Helvetica-Bold')
        .text('Certificate ID:', rightCol, tableY + 50);
      doc.font('Helvetica')
        .text(`#${cert.id}`, rightCol, tableY + 70);

      doc.font('Helvetica-Bold')
        .text('Issue Date:', rightCol, tableY + 100);
      doc.font('Helvetica')
        .text(new Date(cert.createdAt ?? new Date()).toLocaleDateString(), rightCol, tableY + 120);

      // QR Code Section
      doc.moveDown(8);
      const qrY = doc.y;

      // Generate QR code with certificate verification URL
      const qrData = `https://your-domain.com/verify?id=${cert.id}&rollNumber=${cert.rollNumber}`;
      const qrImage = QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 150,
        margin: 1,
      });

      qrImage
        .then((qrUrl: string) => {
          doc.fontSize(10)
            .font('Helvetica')
            .text('Scan to verify:', { align: 'center' })
            .moveDown(0.3);

          // Extract base64 from data URL
          const base64Data = qrUrl.split(',')[1];
          const qrBuffer = Buffer.from(base64Data, 'base64');

          doc.image(qrBuffer, doc.page.width / 2 - 75, doc.y, {
            width: 150,
            height: 150,
          });

          doc.moveDown(6);

          // Blockchain Details
          doc.fontSize(10)
            .font('Helvetica-Bold')
            .text('Blockchain Verification:', { align: 'center' })
            .moveDown(0.2)
            .font('Helvetica')
            .fontSize(8)
            .text(`TX Hash: ${cert.txHash || 'Pending'}`, { align: 'center' })
            .moveDown(0.2)
            .text(`Block Hash: ${cert.blockHash || 'N/A'}`, { align: 'center' });

          // Footer
          doc.moveDown(2)
            .fontSize(9)
            .font('Helvetica')
            .text('This certificate is digitally verified on the blockchain and cannot be forged.', {
              align: 'center',
            })
            .moveDown(0.3)
            .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

          doc.end();
        })
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}
