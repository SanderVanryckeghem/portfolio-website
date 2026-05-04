export interface Technology {
  id: number;
  name: string;
  icon: string;
  category: TechCategory;
  proficiency?: number; // 0-100
  yearsOfExperience?: number;
  color?: string;
}

export enum TechCategory {
  FRONTEND = 'Frontend',
  BACKEND = 'Backend',
  MOBILE = 'Mobile',
  CLOUD = 'Cloud',
  TOOLS = 'Tools',
}
