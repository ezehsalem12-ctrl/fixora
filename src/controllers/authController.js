import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.jwt_secret, {
    expiresIn: "3d",
  });
};

//register user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    //validate user
    if (!name || !email || !password) {
      return res.status(400).json({ message: "invalid input" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "user already exist" });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    //create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "registration successfull",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

//user login
export const logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //find user
    const user = await User.findOne({ email });

    //validate user
    if (!user) {
      return res.status(401).json({ message: "invalid credientials" });
    }

    //compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    //validate password
    if (!passwordMatch) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

//user logout
export const logOut = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "logout successfull",
    });
  } catch (error) {
    next(error);
  }
};
