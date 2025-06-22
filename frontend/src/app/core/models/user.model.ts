export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiry: Date | null;
  passwordResetToken: string | null;
  passwordResetTokenExpiry: Date | null;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
