import express from "express"

import {
    activateUser,
    deActivateUser,
    getUser,
    getUserById,
    loginUser,
    logoutAdmin,
    logoutUser,
    registerAdmin,
    registerUser
}
    from "../controller/authController"

const authrouter = express.Router()

authrouter.post("/register", registerUser)
authrouter.post("/login", loginUser)
authrouter.post("/logout", logoutUser)
authrouter.post("/register-admin", registerAdmin)
authrouter.post("/logout-admin", logoutAdmin)
authrouter.put("/activate/:id", activateUser)
authrouter.put("/deActivate/:id", deActivateUser)
authrouter.get("/user", getUser)
authrouter.post("/user/:id", getUserById)

export default authrouter