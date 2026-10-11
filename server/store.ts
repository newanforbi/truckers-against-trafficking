import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import { REPORT_STATUSES, type CreateReportInput, type StoredComment, type StoredReport, type UpdateReportInput } from './types';

type DatabaseFile = {
  reports: StoredReport[];
};

function normalize(report: StoredReport): StoredReport {
  const observation = report.observation ?? '';
  const locationLabel = report.locationLabel ?? '';
  return {
    ...report,
    title: report.title?.trim() || observation.trim() || locationLabel || 'Truck-stop report',
    score: Number.isFinite(report.score) ? report.score : 1,
    comments: Array.isArray(report.comments) ? report.comments : [],
    photos: Array.isArray(report.photos) ? report.photos : [],
    vehicles: report.vehicles ?? '',
    people: report.people ?? '',
    officerNotes: report.officerNotes ?? '',
    status: REPORT_STATUSES.includes(report.status) ? report.status : 'new',
  };
}

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
    if (!input.locationLabel.trim() && !input.observation.trim() && !input.title?.trim() && input.photos.length === 0) {
      throw new Error('Add a location, photo, or what you saw');
    }

    const now = new Date().toISOString();
    const observation = input.observation.trim();
    const locationLabel = input.locationLabel.trim();
    const report: StoredReport = {
      id: randomUUID(),
      createdAt: now,
      observedAt: input.observedAt && !Number.isNaN(Date.parse(input.observedAt)) ? input.observedAt : now,
      title: (input.title ?? '').trim() || observation || locationLabel || 'Truck-stop report',
      locationLabel,
      latitude: input.latitude,
      longitude: input.longitude,
      vehicles: input.vehicles.trim(),
      people: input.people.trim(),
      observation,
      status: 'new',
      officerNotes: '',
      reporterId: input.reporterId.trim() || 'anonymous',
      score: 1,
      comments: [],
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

  vote(id: string, delta: number): StoredReport {
    const report = this.get(id);
    if (!report) {
      throw new Error('Report not found');
    }
    const step = delta >= 0 ? 1 : -1;
    report.score = Math.max(0, report.score + step);
    this.write();
    return report;
  }

  addComment(id: string, author: string, body: string): StoredComment {
    const report = this.get(id);
    if (!report) {
      throw new Error('Report not found');
    }
    const text = body.trim();
    if (!text) {
      throw new Error('Write a comment');
    }
    const comment: StoredComment = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      author: author.trim() || 'anonymous',
      body: text,
    };
    report.comments.push(comment);
    this.write();
    return comment;
  }

  upsertSeeds(reports: StoredReport[]): void {
    const existing = new Set(this.data.reports.map((report) => report.seedKey).filter(Boolean));
    const extras = reports.filter((report) => report.seedKey && !existing.has(report.seedKey));
    if (extras.length === 0 && this.data.reports.length > 0) {
      this.data.reports = this.data.reports.map(normalize);
      this.write();
      return;
    }
    if (this.data.reports.length === 0) {
      this.data.reports = reports.map(normalize);
    } else {
      this.data.reports = [...extras.map(normalize), ...this.data.reports.map(normalize)];
    }
    this.write();
  }

  private read(): DatabaseFile {
    try {
      const parsed = JSON.parse(readFileSync(this.filePath, 'utf8')) as DatabaseFile;
      const reports = Array.isArray(parsed.reports) ? parsed.reports.map(normalize) : [];
      return { reports };
    } catch {
      return { reports: [] };
    }
  }

  private write(): void {
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }
}
