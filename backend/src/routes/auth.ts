import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = Router();

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
      cleanEmail.length > 254 ||
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

export default router;
