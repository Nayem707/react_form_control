const {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  updateUserProfileImage,
  getAllUsers,
} = require('../db/queries/userQueries');

const {
  hashPassword,
  comparePassword,
  generateToken,
  isValidEmail,
  validatePassword,
} = require('../utils/auth');

/**
 * @route POST /api/auth/register
 * @desc Register a new user with optional profile image
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // Validation
    if (!name || !email || !password || !username) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, username, email, and password are required',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address',
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Invalid password',
        message: passwordValidation.message,
      });
    }

    // Check if user already exists (email or username)
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists',
      });
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        error: 'Username taken',
        message: 'This username is already taken',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Prepare user data
    const userData = {
      fullName: name,
      username,
      email,
      password: hashedPassword,
      profileImage: req.file ? `uploads/${req.file.filename}` : null,
    };

    // Create user
    const newUser = await createUser(userData);

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred while creating the user',
    });
  }
};

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address',
      });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred while logging in',
    });
  }
};

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */

const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
    }

    res.status(200).json({
      message: 'Profile retrieved successfully',
      user,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'An error occurred while fetching the profile',
    });
  }
};

/**
 * @route PUT /api/auth/profile-image
 * @desc Update user profile image
 * @access Private
 */
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select an image file to upload',
      });
    }

    const profileImagePath = `uploads/${req.file.filename}`;
    const updatedUser = await updateUserProfileImage(
      req.user.id,
      profileImagePath
    );

    res.status(200).json({
      message: 'Profile image updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile image update error:', error);
    res.status(500).json({
      error: 'Profile image update failed',
      message: 'An error occurred while updating the profile image',
    });
  }
};

/**
 * @route GET /api/auth/users
 * @desc Get all users (public data)
 * @access Private
 */

const allUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      message: 'Users retrieved successfully',
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({
      error: 'Users fetch failed',
      message: 'An error occurred while fetching users',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUserProfile,
  updateProfileImage,
  allUsers,
};
