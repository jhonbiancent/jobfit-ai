const pdfParse = require('pdf-parse/lib/pdf-parse.js');
import * as mammoth from 'mammoth';

export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF document.');
  }
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX document.');
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = file.type;
  const name = file.name.toLowerCase();

  let text = '';

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    text = await parsePdf(buffer);
  } else if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    text = await parseDocx(buffer);
  } else if (type === 'text/plain' || name.endsWith('.txt')) {
    text = buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
  }

  if (text.trim().length < 50) {
    throw new Error("We couldn't read enough text from this document. If it's a scanned image, please try a text-based export.");
  }

  return text;
}
