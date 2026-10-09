import express from "express";
import {
  getMe,
  logIn,
  logOut,
  register,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", logIn);

router.post("/logout", logOut);

router.get("/me", authMiddleware, getMe);

export default router;
