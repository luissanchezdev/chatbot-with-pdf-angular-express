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
  console.log(req.headers)
  const userId = req.headers['x-user-id'];
  console.log(userId)
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploading file:', req.file.path);

    console.log('Aqui comienza el problema')
    const fileId = await chatService.uploadFile(req, req.file.path, userId);
    res.json({ message: 'File uploaded successfully', fileId, fileName: await chatService.getFileName(userId) });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Un error ha ocurrido al subir el archivo' });
  }
});

router.post('/message', auth, async (req, res) => {
  //console.log(req.headers)
  const userId = req.headers['x-user-id'];
  console.log({ userId })
  console.log('message')
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: 'Mensaje es requerido' });
    }
    if (!await chatService.hasFile(userId)) {
      return res.status(400).json({ error: 'Chat no disponible, por favor suba un documento primero' });
    }
    const response = await chatService.sendMessage(userMessage, userId);
    res.json({ response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Un error ha ocurrido cuando se procesaba la petición' });
  }
});

router.get('/chat-status', auth, async (req, res) => {
  console.log(req.headers)
  const userId = req.headers['x-user-id'];
  let chatAvailable
  let currentFile
  await chatService.hasFile(userId).then((response) => {
    console.log({ responseHashFile: response })
    chatAvailable = response
  })
  await chatService.getFileName(userId).then((response) => {
    console.log(response)
    currentFile = response
  })

  console.log({
    chatAvailable,
    currentFile
  })

  
  res.json({
    chatAvailable,
    currentFile
  });
});

module.exports = router;