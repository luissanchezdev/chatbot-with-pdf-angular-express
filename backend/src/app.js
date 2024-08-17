const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const port = process.env.NODE_ENV === 'test' ? process.env.PORT_TEST : process.env.PORT || 3000;


const dbConnection = process.env.NODE_ENV === 'test' ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI;

mongoose.connect(dbConnection, { useNewUrlParser: true, useUnifiedTopology: true })
  
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde el directorio 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Something went wrong on the server',
      status: err.status || 500
    }
  });
});

// Manejador para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      status: 404
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});