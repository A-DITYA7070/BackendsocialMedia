import express from "express";
import {
    registerUser,
    loginUser, 
    followUser, 
    logout, 
    updatePassword, 
    updateProfile, 
    deleteMyProfile, 
    myProfile, 
    getUserProfile, 
    getAllUsers, 
    forgetPassword,
    resetPassword
} from "../controllers/userControllers.js";
import { isAuthenticated } from "../middlewares/auth.js";


const router=express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/follow/:id").get(isAuthenticated,followUser);
router.route("/logout").get(logout);
router.route("/update/password").put(isAuthenticated,updatePassword);
router.route("/update/profile").put(isAuthenticated,updateProfile);
router.route("/delete/me").delete(isAuthenticated,deleteMyProfile);
router.route("/me").get(isAuthenticated,myProfile);
router.route("/user/:id").get(isAuthenticated,getUserProfile);
router.route("/users").get(isAuthenticated,getAllUsers);
router.route("/forgot/password").post(isAuthenticated,forgetPassword);
router.route("/password/reset/:token").put(resetPassword);

export default router;