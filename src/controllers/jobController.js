import Job from "../models/jobModel.js";
import mongoose from "mongoose";

export const createJob = async (req, res, next) => {
  try {
    //destruct
    const { service, description, location, price, category } = req.body;

    //validate
    if (!service || !description || !location || !price || !category) {
      return res
        .status(400)
        .json({ message: "please fill in the required fields" });
    }

    //create job
    const job = await Job.create({
      customer: req.user._id,
      service,
      description,
      location,
      price,
      category,
    });

    res.status(201).json({ message: "job created successfully", data: job });
  } catch (error) {
    next(error);
  }
};

//get job by category
export const getJobByCategory = async (req, res, next) => {
  try {
    const { page, skip, limit } = req.pagination;

    const category = req.params.category.toLowerCase();

    const validCategories = Job.schema.path("category").enumValues;

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "invalid job category" });
    }

    const jobs = await Job.find({
      category,
      status: "requested",
      provider: null,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "job found successfully",
      jobs,
      pagination: { limit, page },
    });
  } catch (error) {
    next(error);
  }
};

//get available jobs
export const getAvailableJob = async (req, res, next) => {
  try {
    //destruct pagination
    const { skip, limit, page } = req.pagination;

    //find job
    const jobs = await Job.find({
      status: "requested",
      provider: null,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(jobs);

    const totalJobs = await Job.countDocuments();

    res.status(200).json({
      message: "job found successfully",
      jobs,
      pagination: { limit, totalJobs, page },
    });
  } catch (error) {
    next(error);
  }
};

//get available jobs by id

export const getAvailableJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    res.status(200).json({
      message: "job found successfully",
      jobs: job,
    });
  } catch (error) {
    next(error);
  }
};

//get my jobs
export const getCustomerJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ customer: req.user._id });

    res.status(200).json({ message: "job retrieved successfully", jobs });
  } catch (error) {
    next(error);
  }
};

export const acceptJob = async (req, res, next) => {
  try {
    //only providers can accept this job
    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "only providers can accept jobs" });
    }

    // get the job id from the url parameters
    const { jobId } = req.params;

    // find the job in the database
    const job = await Job.findById(jobId);

    // check if the job still exists
    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    // check if the job has not already taken or completed
    if (job.status !== "requested") {
      return res
        .status(400)
        .json({ message: "This job is no longer available" });
    }

    // change the job status from requested to accepted
    job.status = "accepted";

    //save the id of the provider who accepted the job
    job.provider = req.user._id;

    await job.save();

    //
    res.status(200).json({ message: "job accepted successfully", job });
  } catch (error) {
    next(error);
  }
};

// change to in progress
export const changeToInProgress = async (req, res, next) => {
  try {
    // Only providers can change the job to in_progress
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "only providers can start jobs" });
    }

    const { jobId } = req.params;

    // Find the job
    const job = await Job.findById(jobId);

    // Check if the job exists
    if (!job) {
      return res.status(404).json({
        message: "job not found",
      });
    }

    // Job must be accepted first
    if (job.status !== "accepted") {
      return res.status(400).json({
        message: "job must be accepted",
      });
    }

    // Check that this provider owns the job
    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "unauthorized",
      });
    }

    // Change status
    job.status = "in_progress";

    // Save the updated job
    await job.save();

    res.status(200).json({
      message: "job is now in progress",
      job,
    });
  } catch (error) {
    next(error);
  }
};

//change to review
export const changeToReview = async (req, res, next) => {
  try {
    //only providers can submit jobs for review
    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "only providers can submit jobs for review" });
    }

    const { jobId } = req.params;

    //find the job
    const job = await Job.findById(jobId);

    //check if the job exists
    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    //job must be in progress first
    if (job.status !== "in_progress") {
      return res.status(400).json({ message: "job must be in progress" });
    }

    //check that this provider owns the job
    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "unauthorized" });
    }

    //change status
    job.status = "awaiting_review";

    // save the updated job
    await job.save();

    return res.status(200).json({
      message: " job submitted for customer review successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

export const changeToCompleted = async (req, res, next) => {
  try {
    //only customers can complete jobs
    if (req.user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "only customers can complete jobs" });
    }

    const { jobId } = req.params;

    // find the job
    const job = await Job.findById(jobId);

    //check if the jobs still exists
    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    //Job must be review first
    if (job.status !== "awaiting_review") {
      return res.status(400).json({ message: "job must be under review" });
    }

    //check that this customer owns the job
    if (job.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "unauthorized" });
    }

    //change status
    job.status = "completed";

    //save the updated job
    await job.save();

    res.status(200).json({ message: "job completed successfully", job });
  } catch (error) {
    next(error);
  }
};

//cancel job
export const cancelJob = async (req, res, next) => {
  try {
    //only customers can cancel jobs
    if (req.user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "only customers can cancel jobs" });
    }

    const { jobId } = req.params;

    //find the job
    const job = await Job.findById(jobId);

    //check if the job exists
    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    //check that this customer owns the job
    if (job.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "unauthorized" });
    }

    //Job can only be cancelled when requested
    if (job.status !== "requested") {
      return res
        .status(400)
        .json({ message: "only requested job can be cancelled" });
    }

    //change status to cancelled
    job.status = "cancelled";

    //save the updated job
    await job.save();

    return res.status(200).json({ message: "job cancelled successfully", job });
  } catch (error) {
    next(error);
  }
};

// export const changeJobStatus = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const { status } = req.body;

//     const userId = String(req.user._id);

//     const { role } = req.user;

//     if (!isValidObjectId(id)) {
//       return res.status(400).json({ message: "invalid id" });
//     }

//     const allowedStatus = [
//       "accepted",
//       "in_progress",
//       "awaiting_review",
//       "completed",
//       "cancelled",
//     ];

//     if (!allowedStatus.includes(status)) {
//       return res.status(400).json({ message: "invalid status" });
//     }

//     const job = await Job.findById(id);
//     if (!job) {
//       return res.status(404).json({ message: "job not found" });
//     }

//     let filter;

//     let update;

//     // label Customer Allowed Status
//     if (role === "customer") {
//       if (String(job.customer !== userId)) {
//         return res
//           .status(403)
//           .json({ message: "you are not authorized to modify this job" });
//       }
//     }

//     if (status !== "cancelled") {
//       return res.status(403).json({ message: "only customer can cancel job" });
//     }

//     if (job.status !== "requested") {
//       return res
//         .status(400)
//         .json({ message: "only requested jobs can be cancelled " });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

export const changeProviderJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const status = req.body?.status;

    const userId = String(req.user._id);

    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "only providers can perform this action" });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "invalid id" });
    }

    const transitions = {
      accepted: "requested",
      in_progress: "accepted",
      awaiting_review: "in_progress",
    };

    if (!Object.hasOwn(transitions, status)) {
      return res.status(400).json({
        message: "Invalid provider status",
      });
    }

    const filter = {
      _id: id,
      status: transitions[status],
      ...(status === "accepted" ? { provider: null } : { provider: userId }),
    };

    // $set changes a field without replacing the entire document
    const update = {
      $set: {
        status,
        ...(status === "accepted" ? { provider: userId } : {}),
      },
    };

    const job = await Job.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    })
      .populate("customer", "name")
      .populate("provider", "name");

    if (!job) {
      const existingJob = await Job.findById(id);

      if (!existingJob) {
        return res.status(404).json({ message: "job not found" });
      }

      return res.status(409).json({
        message:
          "job is unavailable, has been assigned to another provider or has an inavalid transition status",
        job,
      });
    }

    res.status(200).json({ message: "status updated successfully", job });
  } catch (error) {
    next(error);
  }
};

export const changeCustomerJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = req.body?.status;
    const userId = String(req.user._id);

    // Only customers can perform this action
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Only customers can perform this action",
      });
    }

    // Validate job ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    // Customer-authorized status transitions
    const transitions = {
      completed: "awaiting_review",
      cancelled: ["requested"],
    };

    if (!Object.hasOwn(transitions, status)) {
      return res.status(400).json({
        message: "Invalid customer status",
      });
    }

    const allowedPreviousStatuses = Array.isArray(transitions[status])
      ? transitions[status]
      : [transitions[status]];

    // Customers can update only their own jobs
    const filter = {
      _id: id,
      customer: userId,
      status: { $in: allowedPreviousStatuses },
    };

    const update = {
      $set: { status },
    };

    const job = await Job.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    })
      .populate("customer", "name")
      .populate("provider", "name");

    if (!job) {
      const existingJob = await Job.findById(id);

      if (!existingJob) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      return res.status(409).json({
        message:
          "Job cannot be updated because it does not belong to you or its current status does not allow this transition",
      });
    }

    return res.status(200).json({
      message: "Job status updated successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};
