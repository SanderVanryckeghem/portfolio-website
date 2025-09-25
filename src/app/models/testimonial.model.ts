export interface Testimonial {
  id: number;
  name: string;
  position: string;
  company: string;
  content: string;
  rating?: number;
  imageUrl?: string;
  linkedinUrl?: string;
  featured?: boolean;
}
