export interface Developer {
  name: string;
  title: string;
  bio: string;
  avatar?: string;
  avatarCv?: string;
  skills: string[];
  email?: string;
  phone?: string;
  location?: string;
  social: SocialLinks;
  employer?: Employer;
}

export interface Employer {
  name: string;
  kind: string;
  description: string;
  since: Date;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
}
