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
  DATABASE = 'Database',
  DEVOPS = 'DevOps',
  TOOLS = 'Tools',
  OTHER = 'Other'
}
