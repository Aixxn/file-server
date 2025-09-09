const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create an Express app
const app = express();
// Serve static files (CSS, JS, images)
app.use(express.static(__dirname));
const PORT = process.env.PORT || 3000;

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads' folder exists
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir); // Store in 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Use the original file name
    cb(null, file.originalname);
  }
});

// Create a file upload instance with size and file type validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    // Allow only specific file types (e.g., images)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Allow the file
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle the file upload
app.post('/upload', upload.single('file'), (req, res) => {
  // Success message
  res.send(`
    <h1>File uploaded successfully!</h1>
    <p>File: ${req.file.filename}</p>
    <div class="success-message">Your file has been uploaded successfully!</div>
    <br><a href="/">Back to upload page</a>
  `);
});

// Error handling middleware for file upload errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors (e.g., file size exceeded)
    res.status(400).send(`<div class="error-message">${err.message}</div><br><a href="/">Back to upload page</a>`);
  } else if (err) {
    // Other errors (e.g., invalid file type)
    res.status(400).send(`<div class="error-message">${err.message}</div><br><a href="/">Back to upload page</a>`);
  } else {
    next();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
