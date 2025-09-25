export interface Education {
  id: number;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current?: boolean;
  description?: string;
  gpa?: number;
  achievements?: string[];
}
