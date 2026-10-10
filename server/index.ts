import { randomUUID } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';

import cors from 'cors';
import express from 'express';
import multer from 'multer';

import { seedIfEmpty } from './seed';
import { ReportStore } from './store';
import { REPORT_STATUSES, type PublicReport, type ReportStatus, type StoredReport } from './types';

const root = process.cwd();
const dataDir = process.env.DATA_DIR ?? join(root, 'data');
const uploadsDir = join(dataDir, 'uploads');
const publicDir = join(root, 'server', 'public');
const port = Number(process.env.PORT ?? 3001);
const officerKey = process.env.OFFICER_KEY ?? 'WATCH';

mkdirSync(uploadsDir, { recursive: true });

const store = new ReportStore(dataDir);
seedIfEmpty(store, uploadsDir, join(root, 'assets', 'splash-icon.png'));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, done) => done(null, uploadsDir),
    filename: (_req, file, done) => {
      const ext = extname(file.originalname || '').toLowerCase() || '.jpg';
      done(null, `${Date.now()}-${randomUUID()}${ext}`);
    },
  }),
  limits: { files: 4, fileSize: 8 * 1024 * 1024 },
});

function publicUrl(req: express.Request, filename: string): string {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

function toPublic(req: express.Request, report: StoredReport): PublicReport {
  return {
    ...report,
    photos: report.photos.map((photo) => ({
      id: photo.id,
      url: publicUrl(req, photo.filename),
    })),
  };
}

function paramId(req: express.Request): string {
  const value = req.params.id;
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

function requireOfficer(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const submitted = req.get('x-officer-key') ?? '';
  if (submitted !== officerKey) {
    res.status(401).json({ error: 'Officer key required' });
    return;
  }
  next();
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(publicDir));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, reports: store.list().length });
});

app.get('/api/reports', (req, res) => {
  res.json({ reports: store.list().map((report) => toPublic(req, report)) });
});

app.get('/api/reports/:id', (req, res) => {
  const report = store.get(paramId(req));
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  res.json({ report: toPublic(req, report) });
});

app.post('/api/reports', upload.array('photos', 4), (req, res) => {
  try {
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const report = store.create({
      observedAt: String(req.body.observedAt ?? ''),
      locationLabel: String(req.body.locationLabel ?? ''),
      latitude,
      longitude,
      vehicles: String(req.body.vehicles ?? ''),
      people: String(req.body.people ?? ''),
      observation: String(req.body.observation ?? ''),
      reporterId: String(req.body.reporterId ?? 'anonymous'),
      photos: files.map((file) => ({ id: randomUUID(), filename: file.filename })),
    });
    res.status(201).json({ report: toPublic(req, report) });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid report' });
  }
});

app.patch('/api/reports/:id', requireOfficer, (req, res) => {
  try {
    const status = req.body.status as ReportStatus | undefined;
    if (status && !REPORT_STATUSES.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    const report = store.update(paramId(req), {
      status,
      officerNotes: req.body.officerNotes,
    });
    res.json({ report: toPublic(req, report) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    res.status(message === 'Report not found' ? 404 : 400).json({ error: message });
  }
});

app.get('/desk', (_req, res) => {
  res.sendFile(join(publicDir, 'desk.html'));
});

app.get('/embed', (_req, res) => {
  res.sendFile(join(publicDir, 'embed.html'));
});

app.get('/uploads/:name', (req, res) => {
  const filePath = join(uploadsDir, req.params.name);
  if (!existsSync(filePath)) {
    res.status(404).end();
    return;
  }
  createReadStream(filePath).pipe(res);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`See Snap Report platform on http://localhost:${port}`);
    console.log(`Officer desk: http://localhost:${port}/desk  (key: ${officerKey})`);
  });
}

export { app, officerKey };
