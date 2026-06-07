import mongoose from 'mongoose';

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
    refreshToken : {
        type : String,
        default : null
    }
} , {timestamps : true});


export const User = mongoose.model("User" , userSchema);