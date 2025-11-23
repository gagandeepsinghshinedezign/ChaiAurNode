// import { asyncHandler } from "../../utils/asyncHandler";

import { ApiError } from "../../utils/ApiError.js"
import { User } from "../../models/user.model.js"
import { uploadFileToCloudinary } from "../../utils/cloudanary.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAuthToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { refreshToken, accessToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token.")
    }
}

const registerUser = async (req, res) => {
    const { fullName, userName, email, password } = req.body

    if ([fullName, userName, email, password]?.some((field) => field?.trim() == "")) {
        throw new ApiError(409, "All fields are required.")
    }

    const existingUser = await User.findOne({ $or: [{ email }, { userName }] })

    console.log("existingUser-->", existingUser)

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exist.")
    }

    const avatarLocalPath = req?.files?.avatar?.[0]?.path
    const coverImageLocalPath = req?.files?.coverImage?.[0]?.path || ""

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required.")
    }

    const avatar = await uploadFileToCloudinary(avatarLocalPath)
    let coverImage = ""
    if (coverImageLocalPath) {

        coverImage = await uploadFileToCloudinary(coverImageLocalPath)
    }

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required.")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: avatar?.url,
        coverImage: coverImage ? coverImage?.url : "",
        userName: userName?.toLowerCase()
    })

    const newUser = await User.findById(user?._id).select("-password -refreshToken")

    if (!newUser) {
        throw new ApiError(500, "Something went wrong while trying to register a new uswe")
    }

    res.status(201).json(new ApiResponse(200, newUser, "User registered successfully."))
}

const login = asyncHandler(async (req, res) => {
    // get req username,email,password
    // check email or username exist in db
    // if exist then match the password
    // if password match create the access token and refresh token
    // create cookies
    // return the response

    try {
        const { userName, email, password } = req?.body;

        if (!(userName || email)) {
            throw new ApiError(400, "email or username is required.")
        }
        const user = await User.findOne({
            $or: [{ email }, { userName }]
        })
        if (!user) {
            throw new ApiError(404, "user with email or userName is not exist.")
        }

        const passwordMatch = await user.isPasswordMatch(password);
        if (!passwordMatch) {
            throw new ApiError(400, "Invalid Credentials.")
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        console.log("accessToken--->", accessToken)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secured: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, {
                    data: loggedInUser, accessToken, refreshToken
                }, "User logged in successfully.")
            )
    } catch (error) {
        throw new ApiError(error)

    }
})

const logout = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(req?.user?._id, {
            $set: {
                refreshToken: undefined
            }
        }, {
            new: true
        }
        )

        const options = {
            httpOnly: true,
            secured: true
        }

        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out successfully."))

    } catch (error) {
        throw new ApiError(error?.message)
    }

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized access.")
        }

        const decodedRefreshToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        if (!decodedRefreshToken) {
            throw new ApiError(500, "Something went wrong when trying ")
        }

        const user = await User.findById(decodedRefreshToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token.")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secured: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user?._id)

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshaToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed successfully."))

    } catch (error) {
        throw new ApiError(400, error.message || "Refresh token expired.")
    }
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required.")
    }

    const user = await User.findById(req?.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is invalid")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "Password updated successfully."))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(new ApiResponse(200, req.user, "user fetched successfully."))
})

const updateUserDetails = asyncHandler(async (req, res) => {

    const { fullName, email } = req.body

    if (!fullName && !email) {
        throw new ApiError(400, "All fields can not be empty.")
    }

    const user = await User.findByIdAndUpdate(req.body?._id, {
        $set: {
            fullName,
            email: email
        }
    },
        {
            new: true
        }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "user updated successfully."))
})

const updateProfileImage = asyncHandler(async (req, res) => {
    const avatarLocalPath = req?.file

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadFileToCloudinary(avatarLocalPath);

    if (!avatar?.url) {
        throw new ApiError(500, "Something went wrong when upload file.")
    }

    const user = await User.findByIdAndUpdate(req?.user?._id, {
        $set: {
            avatar: avatar.url
        }
    }, {
        new: true
    }).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully."))
})

export { registerUser, login, logout, refreshAccessToken, changePassword, getCurrentUser, updateUserDetails, updateProfileImage }