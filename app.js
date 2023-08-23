import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

const app=express();

// using dotenv middleware..
if(process.env.NODE_ENV !== 'production'){
    dotenv.config({path:"config/config.env"});  
}

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// using routes..
import post from "./routes/postRoutes.js";
import user from "./routes/userRoutes.js";

app.use("/api/v1",post);
app.use("/api/v1",user);



export default app;