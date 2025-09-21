const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { handleUpload, handleExtract } = require('../controllers/ocrController');

// Add CORS headers for OCR routes
router.use((req, res, next) => {
  console.log('🔍 OCR Route - Origin:', req.headers.origin);
  console.log('🔍 OCR Route - Method:', req.method);
  console.log('🔍 OCR Route - Path:', req.path);
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Configure multer with better error handling
const upload = multer({ 
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, BMP, WEBP, and PDF files are allowed.'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: 'File upload error: ' + error.message });
  } else if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
};



// Test endpoint to verify OCR route is accessible
router.get('/test', (req, res) => {
  console.log('🔍 OCR Test - Request received');
  res.json({ 
    success: true, 
    message: 'OCR route is accessible',
    timestamp: new Date().toISOString()
  });
});

router.post('/upload-financial-doc', upload.single('file'), handleMulterError, handleUpload);
router.post('/extract-financial-info', handleExtract);

module.exports = router; 