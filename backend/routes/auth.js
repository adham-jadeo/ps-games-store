const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({
        where: { [require("sequelize").Op.or]: [{ email }, { username }] },
      });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create new user
      const user = await User.create({
        username,
        email,
        password: await bcrypt.hash(password, 10),
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ["password"] },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, phone, street, city, state, zip, country } =
      req.body;
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.update({
      firstName,
      lastName,
      phone,
      street,
      city,
      state,
      zip,
      country,
    });

    const updatedUser = await User.findByPk(req.userId, {
      attributes: { exclude: ["password"] },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
