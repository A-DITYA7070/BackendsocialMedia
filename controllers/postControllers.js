import Post from "../models/postModels.js";
import User from "../models/userModels.js";

export const createPost = async(req,res)=>{
     try{
        const newPostData = {
            caption:req.body.caption,
            image:{
                public_id:"req.body.public_id",
                url:"req.body.url"
            },
            owner:req.user._id,
        }

        const newPost = await Post.create(newPostData);
        const user = await User.findById(req.user._id);
        
        user.posts.push(newPost._id);

        await user.save();

        res.status(201).json({
            success:true,
            newPost,
        })

     }catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        })
     }
};

// delete post...

export const  deletePost = async(req,res)=>{
    try{

        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                success:false,
                message:"Post not found"
            })
        }

        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success:false,
                message:'Unauthorized'
            })
        }
        
        await post.deleteOne();

        const user = await User.findById(req.user._id);
        const index = user.posts.indexOf(req.params.id);
        
        user.posts.splice(index,1);
        await user.save();

        res.status(200).json({
            success:true,
            message:"post deleted "
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// like and unlike post...

export const likeAndUnlikePost = async(req,res)=>{
    try{

        const post = await Post.findById(req.params.id);
        
        if(!post){
            return res.status(404).json({
                success:false,
                message:"Post not found "
            })
        }
        
        if(post.likes.includes(req.user._id)){
            const index=post.likes.indexOf(req.user._id);
            post.likes.splice(index,1);
            await post.save();
            return res.status(200).json({
                success:true,
                message:"Post unliked"
            })
        }else{
            post.likes.push(req.user._id);
            await post.save();
            return res.status(200).json({
                success:true,
                message:"Post liked "
            })

        }

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

// get post of following...

export const getPostOfFollowing = async(req,res) =>{

    try{

        const user = await User.findById(req.user._id);
        const posts=await Post.find({
            owner:{
                $in:user.following
            }
        });
        
        res.status(200).json({
            success:true,
            posts
        })


    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

// update caption...

export const updateCaption = async(req,res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({
                success:false,
                messsage:"post not found "
            });
        }

        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success:false,
                message:"unauthorize user "
            });
        }

        post.caption = req.body.caption;
        await post.save();

        res.status(200).json({
            success:true,
            message:"Post updated "
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

// comments...

export const commentOnPost = async(req,res) =>{
    try{
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({
                success:false,
                message:"Post Not found"
            });
        }
        
        let commentIndex = -1;

        post.comments.forEach((item,index)=>{
            if(item.user.toString() === req.user._id.toString()){
                commentIndex=index;
            }
        })

        if(commentIndex!==-1){
           post.comments[commentIndex].comment = req.body.comment;
           await post.save();
           return res.status(200).json({
                success:true,
                message:"comment updated "
           });

        }else{
            post.comments.push({
                user:req.user._id,
                comment:req.body.comment,
            });
        }

        await post.save();

        res.status(200).json({
            success:true,
            message:"comment added "
        });

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
};

export const deleteComment = async(req,res)=>{
    try{

        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({
                success:false,
                message:"Post not found "
            });
        }

        
        if(post.owner.toString() === req.user._id.toString()){
            
            if(req.body.commentId == undefined){
                return res.status(400).json({
                    success:false,
                    message:"comment Id is required "
                })
            }
            post.comments.forEach((item,index)=>{
                if(item._id.toString() === req.body.commentId.toString()){
                    return post.comments.splice(index,1);
                }
            });
            await post.save();
            return res.status(200).json({
                success:true,
                message:"selected comment deleted "
            });

        }else{
            
            post.comments.forEach((item,index)=>{
                if(item.user.toString() === req.user._id.toString()){
                    return post.comments.splice(index,1);
                }
            });

            await post.save();
            res.status(200).json({
               sucess:true,
               message:"Your comment deleted "
            })
        }

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
}