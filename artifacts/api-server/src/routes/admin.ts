import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

router.post("/login", async (req, res) => {
  try {
    const parsed = AdminLoginBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation error", message: parsed.error.message });
    }

    const { username, password } = parsed.data;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return res.json({
        success: true,
        token: "admin-session-token-" + Date.now(),
        message: "Login successful",
      });
    }

    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid username or password",
    });
  } catch (err) {
    req.log.error({ err }, "Admin login failed");
    res.status(500).json({ error: "Internal server error", message: "Login failed" });
  }
});

export default router;
