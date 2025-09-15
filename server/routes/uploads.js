import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const recordingsPath = path.resolve(process.cwd(), 'recordings');
const uploadsPath = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'recording') cb(null, recordingsPath);
    else cb(null, uploadsPath);
  },
  filename: (_req, file, cb) => {
    const base = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const ext = path.extname(file.originalname) || (file.mimetype === 'video/webm' ? '.webm' : '');
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 200 }, // 200MB
});

// Save interview recording (video+audio)
router.post('/recording', upload.single('recording'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  return res.json({ ok: true, path: req.file.path.replace(process.cwd(), '').replace(/^\\/,'/') });
});

// Upload resume PDF
router.post('/resume', upload.single('resume'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (path.extname(req.file.filename).toLowerCase() !== '.pdf') {
    return res.status(400).json({ error: 'Only PDF allowed' });
  }
  return res.json({ ok: true, path: req.file.path });
});

export default router;



