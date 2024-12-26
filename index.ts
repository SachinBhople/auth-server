import express, { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { initializeRabbitMQ } from "./service/rabbitmq"
import authrouter from "./Routes/authRoutes"

dotenv.config()


const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(cors({
  credentials: true,
  origin: true
}))

app.use("/api/auth", authrouter)


app.use(
  (err: any, req: Request, res: Response, next: NextFunction): any => {
    console.log(err);
    return res.status(500).json({ message: err.message || "Something went wrong" });
  }
)
initializeRabbitMQ()
mongoose.connect(process.env.MONGO_URL as string)

mongoose.connection.once("open", () => {
  console.log("Mongo Connected")
  app.listen(process.env.PORT, () => {
    console.log(`Server Running on Port ${process.env.PORT}`)
  })
})