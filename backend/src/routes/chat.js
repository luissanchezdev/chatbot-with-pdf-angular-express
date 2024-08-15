const express = require('express');
const router = express.Router();
const chatService = require('../services/chat-service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../routes/auth');
const ObjectId = require('mongodb').ObjectId;

// Asegurarse de que el directorio 'uploads' exista
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /pdf|doc|docx|xls|xlsx/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX files are allowed.'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploading file:', req.file.path);

    console.log('Aqui comienza el problema')
    const fileId = await chatService.uploadFile(req, req.file.path, '66b99c8ac9eb4fe0b265f5d4');
    res.json({ message: 'File uploaded successfully', fileId, fileName: await chatService.getFileName('66b99c8ac9eb4fe0b265f5d4') });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred while uploading the file.' });
  }
});

router.post('/message', auth, async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (!await chatService.hasFile('66b99c8ac9eb4fe0b265f5d4')) {
      return res.status(400).json({ error: 'Chat not available. Please upload a document first.' });
    }
    const response = await chatService.sendMessage(userMessage, '66b99c8ac9eb4fe0b265f5d4');
    res.json({ response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred while processing your request.' });
  }
});

router.get('/chat-status', auth, async (req, res) => {
  res.json({
    chatAvailable: await chatService.hasFile('66b99c8ac9eb4fe0b265f5d4'),
    currentFile: await chatService.getFileName('66b99c8ac9eb4fe0b265f5d4')
  });
});

module.exports = router;