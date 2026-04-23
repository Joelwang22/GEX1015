import fs from 'node:fs/promises';
import path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node extract-pdf-text.mjs <input.pdf> <output.txt>');
  process.exit(1);
}

const data = new Uint8Array(await fs.readFile(inputPath));
const pdf = await getDocument({ data }).promise;
const pages = [];

for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  const lines = [];
  let currentY = null;
  let currentLine = [];

  for (const item of content.items) {
    const y = Math.round(item.transform[5]);
    if (currentY !== null && Math.abs(y - currentY) > 3) {
      lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
      currentLine = [];
    }
    currentY = y;
    currentLine.push(item.str);
  }

  if (currentLine.length > 0) {
    lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
  }

  pages.push(`--- Page ${pageNumber} ---\n${lines.filter(Boolean).join('\n')}`);
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${pages.join('\n\n')}\n`, 'utf8');
