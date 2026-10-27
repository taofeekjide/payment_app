import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = Router();

// To register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body ?? {};

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length > 200) {
      return res.status(400).json({
        message: "Name must be between 1 and 200 characters.",
      });
    }

    if (
      cleanEmail.length > 200 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 200) {
      return res.status(400).json({
        message: "Password must be between 8 and 200 characters.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, role, status, created_at`,
      [cleanName, cleanEmail, passwordHash],
    );

    return res.status(201).json({
      message: "Account created successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration failed:", error);

    return res.status(500).json({
      message: "Could not create account.",
    });
  }
});

// To login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role, status FROM users WHERE email = $1`,
      [cleanEmail],
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "This account is not active",
      });
    }

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    req.session.userId = user.id;

    await new Promise<void>((resolve, reject) => {
      req.session.save((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    return res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      message: "Could not log in, try again later.",
    });
  }
});

// To check if logged in
router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        message: "You are not logged in.",
      });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, role, status, created_at FROM users WHERE id = $1`,
      [req.session.userId],
    );

    const user = result.rows[0];

    if (!user || user.status !== "active") {
      await new Promise<void>((resolve) => {
        req.session.destroy(() => resolve());
      });

      res.clearCookie("payment_app.sid", { path: "/" });

      return res.status(401).json({
        message: "Your session is no longer valid.",
      });
    }

    return res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Session check failed:", error);

    return res.status(500).json({
      message: "Could not check your session.",
    });
  }
});

// TO logout
router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout failed:", error);

      return res.status(500).json({
        message: "Could not log you out, try again.",
      });
    }

    res.clearCookie("payment_app.sid", { path: "/" });

    return res.json({
      message: "Logout successful.",
    });
  });
});

export default router;
