import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Google Login
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Missing idToken" });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ message: "Invalid token" });

    // Find or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
      });
    }

    // Generate tokens
    const accessToken = createAccessToken({ userId: user._id });
    const refreshToken = createRefreshToken({ userId: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google login failed" });
  }
});

// ✅ Email + Password Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Invalid password" });

    const accessToken = createAccessToken({ userId: user._id });
    const refreshToken = createRefreshToken({ userId: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken, user });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// ✅ Signup
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name, password: hashed });

    const accessToken = createAccessToken({ userId: user._id });
    const refreshToken = createRefreshToken({ userId: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({ accessToken, refreshToken, user });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// ✅ Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Missing refresh token" });

    const decoded = verifyRefreshToken<{ userId: string }>(refreshToken);
    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Token mismatch" });

    const newAccessToken = createAccessToken({ userId: user._id });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(500).json({ message: "Token refresh failed" });
  }
});

export default router;
