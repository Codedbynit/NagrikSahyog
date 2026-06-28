export type Department = 'pwd' | 'sanitation' | 'electricity' | 'water';
export type IssueStatus = 'unassigned' | 'in_progress' | 'pending' | 'resolved';

export interface Issue {
  id: string;
  name: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  landmark: string;
  department: Department;
  description: string;
  beforeImage: string;
  afterImage?: string;
  status: IssueStatus;
  contractorName?: string;
  assignedAt?: string;
  resolvedAt?: string;
  rating?: number;
  feedbackText?: string;
  feedbackSubmittedAt?: string;
  aiAuditing?: boolean;
  aiConfidence?: number;
  aiAuditError?: string;
  aiAuditCompleted?: boolean;
  aiFlagged?: boolean;
  aiAutoRejected?: boolean;
  aiFindings?: string[];
  aiReasoning?: string;
  aiRejectionReason?: string;
  aiOfficerLog?: string;
}

export type Language = 'en' | 'hi';

export type AppView = 'landing' | 'citizen' | 'admin' | 'track';
