import multer from "multer";

// Using memoryStorage avoids "path undefined" or "folder not found" errors
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default upload;
