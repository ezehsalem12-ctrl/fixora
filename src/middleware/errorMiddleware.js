const errorMiddleware = (error, req, res, next) => {
  console.log(error);

  const statusCode = error.statusCode || 500;

  req.status(statusCode).json({ message: "error.message" || "internal server error" });

  next();
};

export default errorMiddleware;
