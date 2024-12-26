import mongoose, { Model, Schema } from "mongoose"
import { boolean } from "zod";

export interface User extends Document {
    name: string;
    email: string;
    password: string;
    mobile: string;
    profile:string;
    role: "admin" | "user";
    isActive:boolean // Enum for role
  }

const userSchema:Schema<User> =new mongoose.Schema({
    name:{ 
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["admin","user"],
        default:"user"
    },
    profile:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

const User:Model<User>=mongoose.model<User>("user",userSchema)

export default User