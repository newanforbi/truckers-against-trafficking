export const REPORT_STATUSES = ['new', 'reviewing', 'forwarded', 'closed'] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type StoredPhoto = {
  id: string;
  filename: string;
};

export type StoredReport = {
  id: string;
  createdAt: string;
  observedAt: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  vehicles: string;
  people: string;
  observation: string;
  status: ReportStatus;
  officerNotes: string;
  reporterId: string;
  photos: StoredPhoto[];
};

export type PublicPhoto = {
  id: string;
  url: string;
};

export type PublicReport = Omit<StoredReport, 'photos'> & {
  photos: PublicPhoto[];
};

export type CreateReportInput = {
  observedAt?: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  vehicles: string;
  people: string;
  observation: string;
  reporterId: string;
  photos: StoredPhoto[];
};

export type UpdateReportInput = {
  status?: ReportStatus;
  officerNotes?: string;
};
