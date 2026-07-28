export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface SessionEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}
export declare function validateEmail(email: string): boolean;
export declare function validatePasswordStrength(password: string): {
  valid: boolean;
  reason?: string;
};
//# sourceMappingURL=identity.d.ts.map
