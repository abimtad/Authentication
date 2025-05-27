import { User } from "../models/user.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetSuccessEmail,
  sendForgotPasswordEmail,
} from "../nodeMail/email.js";
import { errorHandler } from "../utils/errorHandler.js";

export const signUp = async (req, res, next) => {
  try {
    if (!req.body || !req.body.email || !req.body.name || !req.body.password) {
      next(errorHandler(400, "All fields are required !"));
    }
    // NOTE: writing this logic at the top without first checking that a body/json
    // is passed/present causes an error since body is undefined getting a property
    //  out of undefined is an error
    const { name, email, password } = req.body;
    console.log("email:", email);

    const userAlreadyExists = await User.findOne({ email });
    console.log(userAlreadyExists);

    if (userAlreadyExists) {
      return next(errorHandler(400, "user already exists"));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    console.log("verification token:", verificationToken);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    const { password: _, ...withoutPassword } = user._doc;

    await user.save();
    console.log("user:", user);

    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User Created Successfully!",
      user: withoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  const { code } = req.body;
  console.log("code: ", code);
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return next(errorHandler(400, "Invalid or expired verification code"));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logIn = async (req, res, next) => {
  // 1. Input Validation
  if (!req.body?.email || !req.body?.password) {
    return next(errorHandler(400, "Email and password are required!"));
  }

  const { email, password } = req.body;

  try {
    // 2. Find User (case-insensitive email)
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(401, "Invalid credentials!")); // Avoid revealing "email doesn't exist"
    }
    console.log("user: ", user);

    // 3. Validate Password
    const isPasswordValid = await bcrypt.compare(password, user.password); // Use `await` (bcrypt.compareSync is blocking)
    if (!isPasswordValid) {
      return next(errorHandler(401, "Invalid credentials!")); // Same message for security
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    next(errorHandler(500, "Login failed. Please try again.")); // Generic error for client
  }
};

export const LogOut = async (req, res) => {
  return res
    .clearCookie("token")
    .json({ success: true, message: "User logged out successfully !" });
};

export const forgotPassword = async (req, res, next) => {
  if (!req.body || !req.body.email) {
    next(errorHandler(400, "All fields are required !"));
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(errorHandler(400, "User not found !"));
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const expiresAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = expiresAt;

    await user.save();

    const resetUrl = process.env.FRONT_URL + `/reset-password/${resetToken}`;
    await sendForgotPasswordEmail(user.email, resetUrl, next);

    res.json({ success: true, message: "Forgot email sent successfully !" });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  if (!req.body || !req.body.password) {
    next(errorHandler(400, "All fields are required !"));
  }

  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) return next(errorHandler(400, "Invalid or expired token !"));

    user.password = bcrypt.hashSync(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    await sendPasswordResetSuccessEmail(user.email);

    res.json({ success: true, message: "Password rested successfully !" });
  } catch (error) {
    next(error);
  }
};

export const checkAuth = async (req, res, next) => {
  try {
    console.log(req.userId);
    const user = await User.findById(req.userId);

    if (!user) return next(errorHandler(404, "User not found !"));

    res.json({ success: true, user: { ...user._doc, password: undefined } });
  } catch (error) {
    next(error);
  }
};
