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
export declare function processPDFBuffer(buffer: Buffer): PDFProcessingResult;
//# sourceMappingURL=pdf-processor.d.ts.map
