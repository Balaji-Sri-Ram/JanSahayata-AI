import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure upload directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

['images', 'videos', 'audio'].forEach((sub) => {
  const subDir = path.join(uploadDir, sub);
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'images';
    if (file.mimetype.startsWith('video/')) {
      folder = 'videos';
    } else if (file.mimetype.startsWith('audio/') || file.originalname.endsWith('.webm') || file.originalname.endsWith('.wav')) {
      folder = 'audio';
    }
    cb(null, path.join(uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || (file.mimetype.startsWith('audio/') ? '.webm' : '.jpg');
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImage = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedVideo = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  const allowedAudio = ['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];

  if (
    allowedImage.includes(file.mimetype) ||
    allowedVideo.includes(file.mimetype) ||
    allowedAudio.includes(file.mimetype) ||
    file.originalname.match(/\.(jpg|jpeg|png|webp|mp4|webm|mov|avi|wav|mp3|ogg|m4a)$/i)
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file format: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

export const complaintUpload = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'disputeMedia', maxCount: 3 },
  { name: 'resolutionMedia', maxCount: 3 }
]);
