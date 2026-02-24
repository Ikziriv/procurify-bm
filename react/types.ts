
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_PROCUREMENT = 'ADMIN_PROCUREMENT',
  USER_PROCUREMENT = 'USER_PROCUREMENT'
}

export type Language = 'EN' | 'ID';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyName?: string;
  avatar?: string;
  ratings?: number[]; // Array of star ratings (1-5)
  phone?: string;
  website?: string;
  history?: string;
  foundedYear?: string;
  employeeCount?: string;
}

export interface Procurement {
  id: string;
  title: string;
  description: string;
  budget: string;
  deadline: string;
  status: 'OPEN' | 'CLOSED' | 'DRAFT';
  createdBy: string;
  createdAt: string;
}

export interface StatusHistoryEntry {
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  changedBy: string;
  changedAt: string;
}

export interface Submission {
  id: string;
  procurementId: string;
  userId: string;
  companyName: string;
  companyDescription: string;
  profileImage: string; // Base64
  submittedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  history?: StatusHistoryEntry[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  read: boolean;
  createdAt: string;
}

export type ViewType = 'DASHBOARD' | 'PROCUREMENTS' | 'USERS' | 'SUBMISSIONS';
