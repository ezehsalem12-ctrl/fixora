import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    await mongoose.connect(uri);

    console.log("MONGODB connected successfully");
  } catch (error) {
    console.error(`MONGODB connection failed ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
