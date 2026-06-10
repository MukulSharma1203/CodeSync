import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from  "bcrypt";


const userSchema =  new mongoose.Schema({
    username : {
        type : String,
        unique : true,
        required : true,
        trim : true
    },
    email : {
        type : String,
        unique : true,
        required : true,
        lowercase : true,
        trim : true
    },
    description : {
        type : String
    },
    passwordHash : {
        type : String,
        required : true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    refreshToken : {
        type : String,
        default : null
    }
} , {timestamps : true});


userSchema.methods.generateAccessToken = async ()=>{
    return await jwt.sign({
        _id : this._id,
        username : this.username,
        email : this.email
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    });
}

userSchema.methods.generateRefreshToken = async ()=>{
    return await jwt.sign({
        _id : this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    });
}

userSchema.methods.isPasswordCorrect = async (password)=>{
    return await bcrypt.compare(password , this.passwordHash);
}


export const User = mongoose.model("User" , userSchema);