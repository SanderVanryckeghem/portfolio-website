export interface Experience {
  id: number;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current?: boolean;
  description: string;
  achievements?: string[];
  technologies?: string[];
  location?: string;
  type?: EmploymentType;
}

export enum EmploymentType {
  FULL_TIME = 'Full Time',
  PART_TIME = 'Part Time',
  CONTRACT = 'Contract',
  FREELANCE = 'Freelance',
  INTERNSHIP = 'Internship'
}
