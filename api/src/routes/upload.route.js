const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/multer');

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await cloudinary.uploader
      .upload_stream({ folder: 'my_pictures' }, (error, result) => {
        if (error) return res.status(500).json(error);
        res.json(result);
      })
      .end(file.buffer);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
