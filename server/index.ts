import { randomUUID } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';

import cors from 'cors';
import express from 'express';
import multer from 'multer';

import { sendExpoPush } from './push';
import { seedIfEmpty } from './seed';
import { AlertStore } from './subscribers';
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
const alerts = new AlertStore(dataDir);
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
      title: String(req.body.title ?? ''),
      locationLabel: String(req.body.locationLabel ?? ''),
      latitude,
      longitude,
      vehicles: String(req.body.vehicles ?? ''),
      people: String(req.body.people ?? ''),
      observation: String(req.body.observation ?? ''),
      reporterId: String(req.body.reporterId ?? 'anonymous'),
      photos: files.map((file) => ({ id: randomUUID(), filename: file.filename })),
    });
    const createdAlerts = alerts.notifyNearby(report);
    createdAlerts.forEach((alert) => {
      const subscriber = alerts.getSubscriber(alert.reporterId);
      if (subscriber) {
        sendExpoPush(subscriber, alert).catch(() => undefined);
      }
    });
    res.status(201).json({ report: toPublic(req, report), alerts: createdAlerts.length });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid report' });
  }
});

app.post('/api/reports/:id/vote', (req, res) => {
  try {
    const delta = Number(req.body.delta) >= 0 ? 1 : -1;
    const report = store.vote(paramId(req), delta);
    res.json({ report: toPublic(req, report) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Vote failed';
    res.status(message === 'Report not found' ? 404 : 400).json({ error: message });
  }
});

app.post('/api/reports/:id/comments', (req, res) => {
  try {
    store.addComment(paramId(req), String(req.body.author ?? 'anonymous'), String(req.body.body ?? ''));
    const report = store.get(paramId(req));
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    res.status(201).json({ report: toPublic(req, report) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Comment failed';
    res.status(message === 'Report not found' ? 404 : 400).json({ error: message });
  }
});

app.post('/api/devices/register', (req, res) => {
  try {
    const subscriber = alerts.register({
      reporterId: String(req.body.reporterId ?? ''),
      latitude: req.body.latitude == null ? undefined : Number(req.body.latitude),
      longitude: req.body.longitude == null ? undefined : Number(req.body.longitude),
      radiusMiles: req.body.radiusMiles == null ? undefined : Number(req.body.radiusMiles),
      enabled: typeof req.body.enabled === 'boolean' ? req.body.enabled : undefined,
      pushToken: req.body.pushToken == null ? undefined : String(req.body.pushToken),
    });
    res.json({ subscriber });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Register failed' });
  }
});

app.get('/api/alerts', (req, res) => {
  const reporterId = String(req.query.reporterId ?? '');
  if (!reporterId.trim()) {
    res.status(400).json({ error: 'reporterId is required' });
    return;
  }
  res.json({
    alerts: alerts.listAlerts(reporterId),
    unread: alerts.listUnread(reporterId),
  });
});

app.post('/api/alerts/test', (req, res) => {
  try {
    const reporterId = String(req.body.reporterId ?? '');
    if (!reporterId.trim()) {
      throw new Error('reporterId is required');
    }
    const subscriber = alerts.getSubscriber(reporterId);
    const radius = subscriber?.radiusMiles ?? 100;
    const alert = alerts.createAlert({
      reporterId,
      reportId: null,
      title: 'Nearby truck-stop report',
      body: `Test alert · ${radius} mi radius · do not approach, call 911 if someone is in danger`,
      miles: 3.2,
    });
    if (subscriber) {
      sendExpoPush(subscriber, alert).catch(() => undefined);
    }
    res.status(201).json({ alert });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Test alert failed' });
  }
});

app.post('/api/alerts/:id/read', (req, res) => {
  const reporterId = String(req.body.reporterId ?? '');
  const alert = alerts.markRead(paramId(req), reporterId);
  if (!alert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }
  res.json({ alert });
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
