const path = require('path');
const express = require('express');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.DB_PATH || './kurstage.db';
const PORT = process.env.PORT || 3000;

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS responses (
    row_id TEXT PRIMARY KEY,
    status TEXT,
    comment TEXT,
    updated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS swatch_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    row_id TEXT,
    contact_name TEXT,
    contact_email TEXT,
    submitted_by TEXT,
    created_at TEXT
  );
`);

function fmtNow() {
  return new Date().toLocaleString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Zurich',
  });
}

function getState() {
  const responseRows = db.prepare('SELECT * FROM responses').all();
  const responses = {};
  for (const row of responseRows) {
    responses[row.row_id] = {
      status: row.status,
      comment: row.comment || '',
      timestamp: row.updated_at || '',
    };
  }

  const swatchRows = db.prepare('SELECT * FROM swatch_contacts ORDER BY id ASC').all();
  const swatch = swatchRows.map((row) => ({
    rowId: row.row_id,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    submittedBy: row.submitted_by,
    timestamp: row.created_at,
  }));

  return { responses, swatch };
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/state', (req, res) => {
  res.json(getState());
});

app.post('/api/response', (req, res) => {
  const { id, status } = req.body || {};
  if (!id || (status !== 'yes' && status !== 'no')) {
    return res.status(400).json({ error: 'id und status (yes/no) erforderlich' });
  }
  const now = fmtNow();
  db.prepare(
    `INSERT INTO responses (row_id, status, comment, updated_at) VALUES (?, ?, '', ?)
     ON CONFLICT(row_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`
  ).run(id, status, now);
  res.json(getState());
});

app.post('/api/response/clear', (req, res) => {
  const { id } = req.body || {};
  if (!id) {
    return res.status(400).json({ error: 'id erforderlich' });
  }
  db.prepare(
    `INSERT INTO responses (row_id, status, comment, updated_at) VALUES (?, NULL, '', NULL)
     ON CONFLICT(row_id) DO UPDATE SET status = NULL`
  ).run(id);
  res.json(getState());
});

app.post('/api/comment', (req, res) => {
  const { id, comment } = req.body || {};
  if (!id) {
    return res.status(400).json({ error: 'id erforderlich' });
  }
  db.prepare(
    `INSERT INTO responses (row_id, status, comment, updated_at) VALUES (?, NULL, ?, NULL)
     ON CONFLICT(row_id) DO UPDATE SET comment = excluded.comment`
  ).run(id, comment || '');
  res.json(getState());
});

app.post('/api/swatch', (req, res) => {
  const { rowId, contactName, contactEmail, submittedBy } = req.body || {};
  if (!rowId || !contactName || !String(contactName).trim() || !submittedBy || !String(submittedBy).trim()) {
    return res.status(400).json({ error: 'rowId, contactName und submittedBy erforderlich' });
  }
  db.prepare(
    `INSERT INTO swatch_contacts (row_id, contact_name, contact_email, submitted_by, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(rowId, String(contactName).trim(), String(contactEmail || '').trim(), String(submittedBy).trim(), fmtNow());
  res.json(getState());
});

app.listen(PORT, () => {
  console.log(`Kurstage-App läuft auf http://localhost:${PORT} (DB: ${DB_PATH})`);
});
