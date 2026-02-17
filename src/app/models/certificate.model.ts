export interface Certificate {
  id: number;
  name: string;
  issuer: string;
  achievedDate: Date;
  expiryDate?: Date;
  credentialUrl?: string;
  icon?: string;
}
