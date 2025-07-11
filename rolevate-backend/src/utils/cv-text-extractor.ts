import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function downloadFile(url: string, dest: string): Promise<void> {
  const writer = fs.createWriteStream(dest);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

export async function extractTextFromCV(fileUrl: string): Promise<string> {
  // Download to temp file
  const ext = path.extname(fileUrl).toLowerCase();
  const tempFile = path.join('/tmp', `cv-${Date.now()}${ext}`);
  await downloadFile(fileUrl, tempFile);
  let text = '';
  try {
    if (ext === '.pdf') {
      const data = await fs.readFile(tempFile);
      const pdf = await pdfParse(data);
      text = pdf.text;
    } else if (ext === '.docx') {
      const data = await fs.readFile(tempFile);
      const result = await mammoth.extractRawText({ buffer: data });
      text = result.value;
    } else if (ext === '.txt') {
      text = await fs.readFile(tempFile, 'utf-8');
    } else {
      throw new Error('Unsupported file type for CV extraction');
    }
  } finally {
    await fs.remove(tempFile);
  }
  return text.trim();
}
