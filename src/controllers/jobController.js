import Job from "../models/jobModel.js";

export const createJob = async (req, res, next) => {
  try {
    //destruct
    const { service, description, location, price } = req.body;

    //validate
    if (!service || !description || !location || !price) {
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
    });

    res.status(201).json({ message: "job created successfully", data: job });
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
    const jobs = await Job.findById(req.params._id);

    if (!jobs) {
      return res.status(404).json({ message: "job not found" });
    }

    res.status(200).json({ message: "job found successfully", jobs });
  } catch (error) {
    next(error);
  }
};

//update job
// export const updateJob = async (req, res, next) => {
//   try {
//     const job = await Job.findByIdAndUpdate(req.params._id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     res.status(200).json({ message: "job updated successfully", job });

//     if (!job) {
//       return res.status(404).json({ message: "job not found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

//delete job
// export const deleteJob = async (req, res, next) => {
//   try {
//     const job = await Job.findByIdAndDelete(req.params._id);

//     res.status(200).json({ message: "job deleted successfully" });

//     if (!job) {
//       return res.status(404).json({ message: "job not found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

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
      return res.status().json({ message: "unauthorized" });
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
