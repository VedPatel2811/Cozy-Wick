const express = require("express");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const generateToken = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

let refreshTokens = [];

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

      const { accessToken, refreshToken } = generateToken(user.id);
      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      }).json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
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
            const user = await User.findOne({ email });
            if (!user) return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });

            const isMatch = await bycrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });

            const { accessToken, refreshToken } = generateToken(user.id);
            refreshTokens.push(refreshToken);

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            }).json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
            } catch (error) {
            console.error(error);
            res.status(500).json({ errors: [{ msg: "Server error" }] });
        }
    }
);

router.post("/refesh-token", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401).json({ msg: "No refresh token" });

  if (!refreshTokens.includes(token)) return res.sendStatus(403).json({ msg: "Invalid refresh token" });

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403).json({ msg: "Token expired or invalid" });
    const { accessToken } = generateToken(decoded.userId);
    res.json({ accessToken });
  });
});

router.post("/logout", (req, res) => {
  const token = req.cookies.refreshToken;
  refreshTokens = refreshTokens.filter(t => t !== token);
  res.clearCookie("refreshToken").json({ msg: "Logged out successfully" });
});

module.exports = router;