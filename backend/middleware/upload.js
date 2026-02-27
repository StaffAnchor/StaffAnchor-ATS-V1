const multer = require('multer');

// Configure multer to use memory storage (store file in buffer)
const storage = multer.memoryStorage();

// File filter to accept only PDF, DOC, and DOCX files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

// PDF-only filter for rank-resumes (up to 10 PDFs)
const pdfOnlyFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for candidate rankings.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Multiple PDFs for rank-resumes (max 10, PDF only)
const uploadRankResumes = multer({
  storage: storage,
  fileFilter: pdfOnlyFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file
  }
}).array('resumes', 10);

module.exports = upload;
module.exports.uploadRankResumes = uploadRankResumes;

