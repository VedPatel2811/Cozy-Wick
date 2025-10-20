const express = require("express");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

const router = express.Router();

/**
 * POST /api/auth/signup
 * body: { name, email, password }
 */
router.post(
  "/signup",
  [
    body("name", "Name is required").not().isEmpty(),
    body("email", "Please include a valid email").isEmail(),
    body(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user)
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });

      const salt = await bycrypt.genSalt(10);
      const hashedPassword = await bycrypt.hash(password, salt);

      user = new User({ name, email, password: hashedPassword });
      await user.save();

      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      res
        .status(201)
        .json({
          token,
          user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
  }
);

router.post(
  "/login",
  [
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password is required").exists(),
    ],

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });

            const isMatch = await bycrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });

            const payload = { user: { id: user.id } };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

            res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
        } catch (error) {
            console.error(error);
            res.status(500).json({ errors: [{ msg: "Server error" }] });
        }
    }
);

module.exports = router;