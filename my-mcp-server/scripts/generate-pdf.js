import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfsDir = path.resolve(__dirname, '../src/data/pdfs');
if (!fs.existsSync(pdfsDir)) {
  fs.mkdirSync(pdfsDir, { recursive: true });
}

const doc = new PDFDocument();
const filePath = path.join(pdfsDir, 'security-policy-v4.pdf');

const stream = fs.createWriteStream(filePath);
doc.pipe(stream);

doc.fontSize(24).text('Information Security Policy', { align: 'center' });
doc.moveDown();
doc.fontSize(14).text('Department: IT Security');
doc.text('Version: 4.0');
doc.text('Effective Date: 2026-07-01');
doc.moveDown();

doc.fontSize(16).text('Policy Facts', { underline: true });
doc.moveDown();
doc.fontSize(12).text('password_rotation: 60 days');
doc.text('mfa_required: true');
doc.text('data_classification_levels: 5');

doc.moveDown();
doc.fontSize(16).text('Metadata', { underline: true });
doc.moveDown();
doc.fontSize(12).text('owner: Chief Information Security Officer');
doc.text('last_updated: 2026-07-01T00:00:00Z');
doc.text('classification: confidential');

doc.end();

stream.on('finish', () => {
  console.log(`Generated ${filePath}`);
});
