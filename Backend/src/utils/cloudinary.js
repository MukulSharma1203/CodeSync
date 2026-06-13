import { v2 as cloudinary } from "cloudinary";
import { existsSync, unlinkSync } from "fs";

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null ;
        
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type : "auto"
        })

        if (localFilePath && existsSync(localFilePath)) {
            unlinkSync(localFilePath);
        }
        
        return response ;
        
    } catch (error) {
        console.log(error);

        if (localFilePath && existsSync(localFilePath)) {
            unlinkSync(localFilePath); // remove the locally saved temp file 
        }
        return null
    }
};

export { uploadOnCloudinary };