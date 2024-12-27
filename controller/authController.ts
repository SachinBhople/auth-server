import asyncHandler from "express-async-handler"
import { profileUpload } from "../utils/upload"
import { Request, Response } from "express"
import { loginSchema, registerSchema } from "../middleware/validation"
import { checkEmpty } from "../utils/handleEmpty"
import User from "../model/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import { v2 as cloudinary } from "cloudinary"
import { publishToQueue } from "../service/rabbitmq"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const registerAdmin = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    profileUpload(req, res, async (err) => {
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ errors: validation.error.errors })
        }
        const { name, email, password, mobile, role } = validation.data;
        const { isError, error } = checkEmpty({ name, email, password, mobile, role })
        if (isError) {
            return res.status(400).json({
                status: 400,
                message: "All Fields are Required",
                error
            })
        }
        if (err) {
            return res.status(400).json({
                message: "File uploads Faild", error: err.message
            })
        }
        const result = await User.findOne({
            $or: [{ email }, { mobile }]
        })
        if (result) {
            return res.status(400).json({ status: 400, message: "user already exists" })
        }

        const hash = await bcrypt.hash(password, 10)
        let x;
        if (req.file) {
            let { secure_url } = await cloudinary.uploader.upload(req.file.path)
            x = secure_url
        }
        const data = await User.create({
            name,
            email,
            mobile,
            password: hash,
            profile: x,
            role
        })
        await publishToQueue("adminQueue", data)
        res.status(200).json({
            status: 200,
            message: "User create Successfully",
            data
        })

    })
})

export const registerUser = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    profileUpload(req, res, async (err) => {
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ errors: validation.error.errors })
        }
        const { name, email, password, mobile } = validation.data;
        const { isError, error } = checkEmpty({ name, email, password, mobile })
        if (isError) {
            return res.status(400).json({
                status: 400,
                message: "All Fields are Required",
                error
            })
        }
        if (err) {
            return res.status(400).json({
                message: "File uploads Faild", error: err.message
            })
        }
        const result = await User.findOne({
            $or: [{ email }, { mobile }]
        })
        if (result) {
            return res.status(400).json({ status: 400, message: "user already exists" })
        }

        const hash = await bcrypt.hash(password, 10)
        let x;
        if (req.file) {
            let { secure_url } = await cloudinary.uploader.upload(req.file.path)
            x = secure_url
        }
        const data = await User.create({
            name,
            email,
            mobile,
            password: hash,
            profile: x,
            // role:"user"
        })
        await publishToQueue("userQueue", data)
        res.status(200).json({
            status: 200,
            message: "User create Successfully",
            data
        })

    })
})

export const loginUser = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const validation = loginSchema.safeParse(req.body)
    if (!validation.success) {
        return res.status(400).json({
            status: 400,
            errors: validation.error.errors
        })
    }
    const { email, password } = validation.data
    const { isError, error } = checkEmpty({ password, email })
    if (isError) {
        res.status(400).json({ status: 400, message: "All fields are required", error })
    }

    const result = await User.findOne({ email })
    if (!result) {
        return res.status(400).json({ status: 400, message: "user is not exists" })
    }
    const verify = await bcrypt.compare(password, result.password)
    if (!verify) {
        return res.status(400).json({
            status: 400,
            message: "Password is not match"
        })
    }



    const token = jwt.sign({ userId: result._id }, process.env.JWT_KEY as string, { expiresIn: "5d" });

    // // console.log(result.role, "RRRR");

    // // if (result.role == "user") {
    // // console.log("uUNDER");
    // res.cookie("user", token, {
    //     maxAge: 1000 * 60 * 60 * 24 * 5
    //     // secure: false,
    //     // sameSite: "none"
    // });

    // await publishToQueue("user", result)
    // console.log(req.cookies, "COKIIESSS");


    // } else {
    //     // res.cookie("admin", token, {
    //     //     maxAge: 1000 * 60 * 60 * 24, // 1 day
    //     //     httpOnly: false,
    //     //     secure: false,
    //     //     sameSite: "none"
    //     // })
    //     // await publishToQueue("admin", result)
    // }



    res.cookie("user", token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });

    res.status(200).json({
        message: "Login successful!",
        user: {
            id: result._id,
            role: result.role,
            name: result.name,
            email: result.email,
            mobile: result.mobile,
            profile: result.profile,
        },
    });

})

export const logoutAdmin = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    res.clearCookie("admin")
    res.status(200).json({ status: 200, message: "Admin Logout Successfully" })
})

export const logoutUser = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    res.clearCookie("user")
    res.status(200).json({ status: 200, message: "User Logout Successfully" })
})

export const activateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await User.findByIdAndUpdate(id, { isActive: true });
    res.json({ message: "User activated", result });
})

export const deActivateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await User.findByIdAndUpdate(id, { isActive: false });
    res.json({ message: "User deActivated", result });
})

export const getUser = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const result = await User.find({ role: "user" })
    res.status(200).json({ status: 200, message: "user fetch successfully", result })
})

export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params
    const result = await User.findOne({ id })
    res.status(200).json({ status: 200, message: "user fetch successfully", data: result })
})
