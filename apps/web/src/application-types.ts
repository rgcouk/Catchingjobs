import type { ApplicationData } from './types';
export interface SubmittedApplication extends ApplicationData {
  id?: string;
  rosterRef: string;
  sector: 'chicken' | 'turkey';
  timestamp: string;
  createdAt?: string;
  status?: string;
  jobPosting?: { title: string };
  contacted?: boolean;
  safetyResourcesSent?: boolean;
  safetyTasksCompleted?: boolean;

  // Jotform / Compliance Profile details
  dateOfBirth?: string;
  niNumber?: string;
  addressLine1?: string;
  postcode?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankSortCode?: string;
  hasAsthmaOrAllergies?: boolean | null;
  hasBackIssues?: boolean | null;
  isFitToLift?: boolean | null;
  declarationSigned?: boolean;
  profileFormCompleted?: boolean;
  hasRightToWork: boolean | string | null;
  hasDrivingLicense: boolean | string | null;
  hasForkliftLicense?: boolean | string | null;
  poultryExperience?: string;
}
