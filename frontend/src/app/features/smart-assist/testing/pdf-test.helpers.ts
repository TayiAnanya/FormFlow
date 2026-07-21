/**
 * Builds a minimal PDF containing the provided text lines.
 * Used by unit tests to prove extraction is driven by uploaded document contents.
 */
export function buildSimplePdf(lines: string[]): Uint8Array {
  const escapePdfText = (value: string): string =>
    value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const textOperators = lines
    .map((line, index) => {
      const y = 750 - index * 18;
      return `BT /F1 12 Tf 40 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join('\n');

  const streamContent = textOperators;
  const objects = [
    '1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n',
    '2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n',
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n',
    `4 0 obj<< /Length ${streamContent.length} >>stream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += object;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }
  return bytes;
}

export function createPdfFile(fileName: string, lines: string[]): File {
  const bytes = buildSimplePdf(lines);
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return new File([blob], fileName, { type: 'application/pdf' });
}
