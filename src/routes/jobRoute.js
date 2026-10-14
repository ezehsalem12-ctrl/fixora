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
  getJobByCategory,
} from "../controllers/jobController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import pagination from "../middleware/pagination.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job creation, discovery, acceptance, and status management
 */

/**
 * @swagger
 * /api/jobs/:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service
 *               - description
 *               - location
 *               - price
 *               - category
 *             properties:
 *               service:
 *                 type: string
 *                 example: Repair a leaking kitchen tap
 *               description:
 *                 type: string
 *                 example: The kitchen tap is leaking and needs repair.
 *               location:
 *                 type: string
 *                 example: Nnewi, Anambra State
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 5000
 *               category:
 *                 type: string
 *                 enum: [plumbing, electricals, cleaning, painting, carpentry, writing, laundry, tutoring, gardening, other]
 *                 example: plumbing
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Required fields are missing
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createJob);

/**
 * @swagger
 * /api/jobs/available-jobs:
 *   get:
 *     summary: Get available jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of jobs per page
 *     responses:
 *       200:
 *         description: Available jobs retrieved successfully
 */
router.get("/available-jobs", pagination, getAvailableJob);

/**
 * @swagger
 * /api/jobs/category/{category}:
 *   get:
 *     summary: Get available jobs by category
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [plumbing, electricals, cleaning, painting, carpentry, writing, laundry, tutoring, gardening, other]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *       400:
 *         description: Invalid job category
 */
router.get("/category/:category", pagination, getJobByCategory);

/**
 * @swagger
 * /api/jobs/available-jobs/{id}/:
 *   get:
 *     summary: Get a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB job ID
 *     responses:
 *       200:
 *         description: Job found successfully
 *       404:
 *         description: Job not found
 */
router.get("/available-jobs/:id/", getAvailableJobById);

/**
 * @swagger
 * /api/jobs/my-jobs/:
 *   get:
 *     summary: Get the authenticated customer's jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer jobs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my-jobs/", authMiddleware, getCustomerJobs);

/**
 * @swagger
 * /api/jobs/{jobId}/accept/:
 *   patch:
 *     summary: Accept a job as a provider
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job accepted successfully
 *       400:
 *         description: Job is no longer available
 *       403:
 *         description: Only providers can accept jobs
 *       404:
 *         description: Job not found
 */
router.patch("/:jobId/accept/", authMiddleware, acceptJob);

/**
 * @swagger
 * /api/jobs/{jobId}/in-progress/:
 *   patch:
 *     summary: Start an accepted job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job is now in progress
 *       400:
 *         description: Job must be accepted first
 *       403:
 *         description: Provider is not authorized
 *       404:
 *         description: Job not found
 */
router.patch("/:jobId/in-progress/", authMiddleware, changeToInProgress);

/**
 * @swagger
 * /api/jobs/{jobId}/update-to-review/:
 *   patch:
 *     summary: Submit a job for customer review
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job submitted for review
 *       400:
 *         description: Job must be in progress
 *       403:
 *         description: Provider is not authorized
 *       404:
 *         description: Job not found
 */
router.patch("/:jobId/update-to-review/", authMiddleware, changeToReview);

/**
 * @swagger
 * /api/jobs/{jobId}/completed/:
 *   patch:
 *     summary: Mark a reviewed job as completed
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job completed successfully
 *       400:
 *         description: Job must be awaiting review
 *       403:
 *         description: Only the owning customer can complete the job
 *       404:
 *         description: Job not found
 */
router.patch("/:jobId/completed/", authMiddleware, changeToCompleted);

/**
 * @swagger
 * /api/jobs/{jobId}/cancel/:
 *   patch:
 *     summary: Cancel a requested job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job cancelled successfully
 *       400:
 *         description: Only requested jobs can be cancelled
 *       403:
 *         description: Only the owning customer can cancel the job
 *       404:
 *         description: Job not found
 */
router.patch("/:jobId/cancel/", authMiddleware, cancelJob);

export default router;
