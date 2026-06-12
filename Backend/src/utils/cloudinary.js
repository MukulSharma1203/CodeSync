import { v2 as cloudinary } from "cloudinary";
import { unlinkSync } from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null ;
        
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type : "auto"
        })

        await unlinkSync(localFilePath);
        
        return response ;
        
    } catch (error) {
        if(localFilePath){
            await unlinkSync(localFilePath); // remove the locally saved temp file 
        }
        return null
    }
};

export { uploadOnCloudinary };