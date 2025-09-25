export interface Developer {
  name: string;
  title: string;
  bio: string;
  avatar?: string;
  skills: string[];
  email?: string;
  phone?: string;
  location?: string;
  social: SocialLinks;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
}
