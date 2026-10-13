import express from "express";
import {
  acceptJob,
  cancelJob,
  changeToCompleted,
  changeToInProgress,
  changeToReview,
  createJob,
  getAvailableJob,
  getAvailableJobById,
  getCustomerJobs,
} from "../controllers/jobController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import pagination from "../middleware/pagination.js";

const router = express.Router();

router.post("/", authMiddleware, createJob);

router.get("/available-jobs", pagination, getAvailableJob);

router.get("/available-jobs/:id/", getAvailableJobById);

router.get("/my-jobs/", authMiddleware, getCustomerJobs);

router.patch("/:jobId/accept/", authMiddleware, acceptJob);

router.patch("/:jobId/in-progress/", authMiddleware, changeToInProgress);

router.patch("/:jobId/update-to-review/", authMiddleware, changeToReview);

router.patch("/:jobId/completed/", authMiddleware, changeToCompleted);

router.patch("/:jobId/cancel/", authMiddleware, cancelJob);

export default router;
