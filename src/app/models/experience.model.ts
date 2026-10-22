export interface Experience {
  id: number;
  // My employer. As a consultant I'm placed with a `client`; work without a
  // client is an internal `project` of the employer.
  company: string;
  client?: string;
  project?: string;
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
  INTERNSHIP = 'Internship',
}
