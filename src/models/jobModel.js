import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    service: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      required: true,
      enum: [
        "requested",
        "accepted",
        "in_progress",
        "awaiting_review",
        "completed",
        "cancelled",
      ],
      trim: true,
      default: "requested",
    },
  },
  { timestamps: true },
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
