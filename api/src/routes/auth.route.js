const express = require('express');
const { upload, handleMulterError } = require('../utils/fileUpload');
const { authenticateToken } = require('../middleware/auth');
const {
  allUsers,
  loginUser,
  registerUser,
  updateProfileImage,
  getCurrentUserProfile,
} = require('../controller/posts.controller');

const router = express.Router();

router.post(
  '/register',
  upload.single('profileImage'),
  handleMulterError,
  registerUser
);
router.put(
  '/profile-image',
  authenticateToken,
  upload.single('profileImage'),
  handleMulterError,
  updateProfileImage
);

router.post('/login', loginUser);
router.get('/users', authenticateToken, allUsers);
router.get('/me', authenticateToken, getCurrentUserProfile);

module.exports = router;
