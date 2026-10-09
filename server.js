import app from "./src/app.js";
import connectDB from "./src/config/mongoDB.js";
import userRoute from "./src/routes/userRoute.js";
import jobRoute from "./src/routes/jobRoute.js";

const PORT = process.env.PORT || 5000;

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "api is reachable" });
});

app.use("/api/user/", userRoute);

app.use("/api/jobs/", jobRoute);

app.listen(PORT, () => {
  console.log(`app is running at port ${PORT}`);
});
