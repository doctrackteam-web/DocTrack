export interface PDFProcessingResult {
  isValid: boolean;
  pageCount: number;
  isEncrypted: boolean;
  textSnippet?: string;
  error?: string;
}

/**
 * Sandboxed PDF Inspector & Parser.
 * Validates PDF header magic bytes, detects encryption, and extracts page count & metadata safely.
 */
export function processPDFBuffer(buffer: Buffer): PDFProcessingResult {
  // 1. PDF Header Signature check (%PDF-1.x)
  const header = buffer.subarray(0, 10).toString('ascii');
  if (!header.startsWith('%PDF-')) {
    return {
      isValid: false,
      pageCount: 0,
      isEncrypted: false,
      error: 'Invalid file format. Magic header %PDF- missing.',
    };
  }

  const content = buffer.toString('binary');

  // 2. Encryption Detection (/Encrypt keyword)
  if (content.includes('/Encrypt')) {
    return {
      isValid: false,
      pageCount: 0,
      isEncrypted: true,
      error: 'PDF file is password protected or encrypted.',
    };
  }

  // 3. Page Count Extraction (Regex scan for /Count or /Type /Page)
  let pageCount = 0;
  const countMatches = content.match(/\/Count\s+(\d+)/g);
  if (countMatches && countMatches.length > 0) {
    const lastMatch = countMatches[countMatches.length - 1];
    const numMatch = lastMatch?.match(/\d+/);
    if (numMatch) {
      pageCount = parseInt(numMatch[0], 10);
    }
  }

  if (pageCount === 0) {
    const pageMatches = content.match(/\/Type\s*\/Page\b/g);
    pageCount = pageMatches ? pageMatches.length : 1;
  }

  // 4. Basic Text Extraction
  const textMatches = content.match(/\(([^()]+)\)\s*Tj/g) || [];
  const textSnippet = textMatches
    .map((m) => m.slice(1, -3))
    .join(' ')
    .slice(0, 500);

  return {
    isValid: true,
    pageCount: Math.max(pageCount, 1),
    isEncrypted: false,
    textSnippet,
  };
}
