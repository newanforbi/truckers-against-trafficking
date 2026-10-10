import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import { REPORT_STATUSES, type CreateReportInput, type StoredReport, type UpdateReportInput } from './types';

type DatabaseFile = {
  reports: StoredReport[];
};

export class ReportStore {
  private readonly filePath: string;
  private data: DatabaseFile;

  constructor(dataDir: string) {
    mkdirSync(dataDir, { recursive: true });
    this.filePath = join(dataDir, 'reports.json');
    this.data = this.read();
  }

  list(): StoredReport[] {
    return [...this.data.reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  get(id: string): StoredReport | null {
    return this.data.reports.find((report) => report.id === id) ?? null;
  }

  create(input: CreateReportInput): StoredReport {
    if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) {
      throw new Error('A map pin is required');
    }
    if (!input.locationLabel.trim() && !input.observation.trim() && input.photos.length === 0) {
      throw new Error('Add a location, photo, or what you saw');
    }

    const now = new Date().toISOString();
    const report: StoredReport = {
      id: randomUUID(),
      createdAt: now,
      observedAt: input.observedAt && !Number.isNaN(Date.parse(input.observedAt)) ? input.observedAt : now,
      locationLabel: input.locationLabel.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
      vehicles: input.vehicles.trim(),
      people: input.people.trim(),
      observation: input.observation.trim(),
      status: 'new',
      officerNotes: '',
      reporterId: input.reporterId.trim() || 'anonymous',
      photos: input.photos,
    };
    this.data.reports.unshift(report);
    this.write();
    return report;
  }

  update(id: string, input: UpdateReportInput): StoredReport {
    const report = this.get(id);
    if (!report) {
      throw new Error('Report not found');
    }
    if (input.status && !REPORT_STATUSES.includes(input.status)) {
      throw new Error('Invalid status');
    }
    if (input.status) {
      report.status = input.status;
    }
    if (input.officerNotes != null) {
      report.officerNotes = input.officerNotes.trim();
    }
    this.write();
    return report;
  }

  seed(reports: StoredReport[]): void {
    if (this.data.reports.length > 0) {
      return;
    }
    this.data.reports = reports;
    this.write();
  }

  private read(): DatabaseFile {
    try {
      const parsed = JSON.parse(readFileSync(this.filePath, 'utf8')) as DatabaseFile;
      return { reports: Array.isArray(parsed.reports) ? parsed.reports : [] };
    } catch {
      return { reports: [] };
    }
  }

  private write(): void {
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }
}
