export interface ContactForm {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  timestamp?: Date;
}
