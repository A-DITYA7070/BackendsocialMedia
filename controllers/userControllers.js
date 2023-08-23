import User from "../models/userModels.js";
import Post from "../models/postModels.js";
import { sendEmail } from "../middlewares/sendEmail.js";
import crypto from "crypto";

export const registerUser = async(req,res)=>{
    try{
        const {name,email,password} = req.body;
        
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"user already exists",
            })
        }

        user = await User.create({
            name,
            email,
            password,
            avatar:{
                public_id:"pivlic_id",
                url:"puvlicUrl"
            }
        });

        const token =await user.generateToken();

        res.status(200).cookie(
            "token",
            token,
            {
                expires:new Date(Date.now()+90*24*60*60*1000),
                httpOnly:true,
            },
        ).json({
            success:true,
            user,
            token
        });

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        });
    };
}

// login user..

export const loginUser = async(req,res)=>{
    try{
        
        const {email,password} = req.body;
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return res.status(400).json({
                success:false,
                message:"user does not exists"
            });
        }

        const isMatch = await user.matchPassword(password);
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect password",
            })
        }

        const token =await user.generateToken();

        res.status(200).cookie(
            "token",
            token,
            {
                expires:new Date(Date.now()+90*24*60*60*1000),
                httpOnly:true,
            },
        ).json({
            success:true,
            user,
            token
        })

    }catch(error){
        
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
};

// logout user...

export const logout = async(req,res) => {
   try{
     
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    }).json({
        success:true,
        message:"Logged out successfully "
    })

   }catch(error){
     res.status(500).json({
        success:false,
        message:error.message
     })
   }
}
// follow user...

export const followUser = async(req,res) =>{
    try{

        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user._id);

        if(!userToFollow){
            return res.status(404).json({
                success:false,
                message:"user does not exist"
            })
        }

        if(loggedInUser.following.includes(userToFollow._id)){
            const indexfollowing = await loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(indexfollowing,1);

            const indexfollowers = await userToFollow.followers.indexOf(loggedInUser._id);
            userToFollow.followers.splice(indexfollowers,1);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({
                success:true,
                message:"user unfollowed "
            });

        }else{

            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);
    
            await loggedInUser.save();
            await userToFollow.save();
    
            res.status(200).json({
                success:true,
                message:"user followed "
            });
        }

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

// update password...

export const updatePassword = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("+password");

        const {oldPassword,newPassword} = req.body;

        if(!oldPassword || !newPassword){
            return res.status(400).json({
                success:false,
                message:"Please provide old pass and new pass "
            })
        }

        const isMatch = await user.matchPassword(oldPassword);
        
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect old password "
            });
        }

        user.password=newPassword;

        await user.save();

        res.status(200).json({
            success:true,
            message:"password updated"
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
};

// update profile..

export const updateProfile = async(req,res) =>{
    try {

        const user = await User.findById(req.user._id);

        const {name,email}=req.body;

        if(!name && !email){
            return res.status(500).json({
                success:false,
                message:"Please enter name or email to update "
            })
        }

        if(name){
            user.name=name;
        }
        if(email){
            user.email=email;
        }
        
        await user.save();

        res.status(200).json({
            success:true,
            message:"Profile updated"
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
};

// delete your account...

export const deleteMyProfile = async(req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        const followers = user.followers;
        const following = user.following;
        const posts=user.posts;
        const userId=user._id;

        await user.deleteOne();

        // logout user after deleting account..

        res.cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:true
        });

        // delete all posts of user..

        for(let i=0;i<posts.length;i++){
            const post=await Post.findById(posts[i]);
            await post.remove();
        }

        // removing user from followers and following..

        for(let i=0;i<followers.length;i++){
            const follower = await User.findById(followers[i]);
            const index = follower.following.indexOf(userId);
            follower.following.splice(index,1);
            await follower.save();
        }

        // removing user from following followers..

        for(let i=0;i<following.length;i++){
            const follows = await User.findById(following[i]);
            const index = follows.followers.indexOf(userId);

            follows.followers.splice(index,1);
            await follows.save();

        }

        res.status(200).json({
            success:true,
            message:"Account deleted.."
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

// get my profile...

export const myProfile = async(req,res) => {
    try{
        const user = await User.findById(req.user._id).populate("posts");

        res.status(200).json({
            success:true,
            user
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

// get any user profile by id..

export const getUserProfile = async(req,res)=>{
    try{
        const user = await User.findById(req.params.id).populate('posts');

        if(!user){
            return res.json({
                success:false,
                message:"user  not found "
            })
        }

        res.status(200).json({
            success:true,
            user,
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

// get all users..

export const getAllUsers = async(req,res)=>{
    try{
        const users = await User.find({});

        res.status(200).json({
            success:true,
            users
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

// forgot password..

export const forgetPassword = async(req,res)=>{
    try{
        
        const user = await User.findOne({email:req.body.email});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found "
            });
        }
        
        const resetPasswordToken = user.getResetPasswordToken();
        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`;
        const message = `Reset your password by clicking on the link below : \n\n ${resetUrl}` ;

        try{
           
            await sendEmail({
                email:user.email,
                subject:"Reset Password",
                message
            });

            res.status(200).json({
                success:true,
                message:`email sent to ${user.email} `
            });

        }catch(error){
           
            user.resetPasswordToken=undefined;
            user.resetPasswordExpire=undefined;
            await user.save();
            res.status(500).json({
                success:false,
                message:error.message
            });
        }


    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

export const resetPassword = async(req,res) =>{
    try{
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user =await User.findOne({
            resetPasswordToken,
            resetPasswordExpire:{
                $gt:Date.now()
            }
        });

        if(!user){
            return res.status(401).json({
                success:false,
                message:"Token invalid/expired "
            });
        }

        user.password=req.body.password;


        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save();
        res.status(500).json({
            success:true,
            message:"Password updated "
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

