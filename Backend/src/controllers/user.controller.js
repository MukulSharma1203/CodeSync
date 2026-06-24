import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { accessOptions, refreshOptions } from "../constants.js";
import fs from "fs";

//register --> working
const userRegister = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    //conditions
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email required",
      });
    }
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username required",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "password required",
      });
    }

    //if exist already or not
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      //unlink sync ../../public/temp image
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (error) {
          console.log("Error deleting temp file:", error);
        }
      }
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    //password hashing
    const passwordHash = await bcrypt.hash(password, 10);

    //avatar
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
      return res.status(400).json({
        success: false,
        message: "Avatar is required",
      });
    }
    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);

    if (!avatarResponse) {
      return res.status(400).json({
        success: false,
        message: "Avatar upload failed",
      });
    }

    const avatar = avatarResponse.secure_url;
    //user creation

    const user = await User.create({
      username,
      email,
      passwordHash,
      avatar,
    });

    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    const createdUser = await User.findById(user._id).select(
      "-passwordHash -refreshToken",
    );

    //accessToken to cookies

    return res
      .status(201)
      .cookie("accessToken", accessToken, accessOptions)
      .cookie("refreshToken", refreshToken, refreshOptions)
      .json({
        success: true,
        user: createdUser,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "error in registering User",
    });
  }
};

//login --> working
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email required",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "password required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `user with email : "${email}" does not exist`,
      });
    }

    const isValid = await user.isPasswordCorrect(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Password Incorrect",
      });
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    //cookies
    const loggedInUser = await User.findById(user._id).select(
      "-passwordHash -refreshToken",
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessOptions)
      .cookie("refreshToken", refreshToken, refreshOptions)
      .json({
        success: true,
        user: loggedInUser,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//logout --> working
const userLogout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        refreshToken: null,
      },
    });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//getUser --> working
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-passwordHash -refreshToken",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // console.log("current user = ", user);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { userLogin, userRegister, userLogout, getCurrentUser };
