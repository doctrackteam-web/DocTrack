/**
 * AES-256 GCM encryption helper
 */
export declare function encryptData(
  plainText: string,
  secretKey: string,
): {
  encrypted: string;
  iv: string;
  tag: string;
};
export declare function decryptData(
  encrypted: string,
  iv: string,
  tag: string,
  secretKey: string,
): string;
//# sourceMappingURL=crypto.d.ts.map
