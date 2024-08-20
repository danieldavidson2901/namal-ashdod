// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './waiting_for_processing';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  console.log('File saved to waiting_for_processing:', req.file.path);
  res.status(200).json({ message: 'File uploaded successfully', fileName: req.file.originalname });
});

app.get('/check-processed/:fileName', (req, res) => {
  const { fileName } = req.params;
  const baseName = path.parse(fileName).name;
  const processedPath = path.join(__dirname, 'processed_images', 'ResultsPhotos', `${baseName}.png`);

  if (fs.existsSync(processedPath)) {
    res.status(200).json({ message: 'Processed image found', filePath: `processed_images/ResultsPhotos/${baseName}.png` });
  } else {
    res.status(404);
  }
});

app.use('/processed_images', express.static(path.join(__dirname, 'processed_images')));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
