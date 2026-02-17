export interface Project {
  id: number;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  imageUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  category?: ProjectCategory;
  completedDate?: Date;
}

export enum ProjectCategory {
  WEB_APP = 'Web Application',
  MOBILE_APP = 'Mobile Application'
}
