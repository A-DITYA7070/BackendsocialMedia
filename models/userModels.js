import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter your name ']
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:[true,"Email already exists "],
    },
    password:{
        type:String,
        required:[true,"Please enter your password "],
        minLength:[6,"Password must be atleast 6 chars long "],
        select:false,
    },
    avatar:{
        public_id:String,
        url:String,
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
        }
    ],
    followers:[
        {
            type : mongoose.Schema.Types.ObjectId ,
            ref:"User"
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
    ],
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);
    }
    next();
});

userSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password,this.password);   //return true or false
};

userSchema.methods.generateToken = function(){
    return jwt.sign({_id:this._id},process.env.JWT_SECRET);
};

userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken ; 
};

export default mongoose.model("User",userSchema);