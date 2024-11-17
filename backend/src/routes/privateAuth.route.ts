import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

// POST /api/v1/auth/login
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.HandleRefreshToken);
router.post("/logout", AuthController.Logout);

export default router;
