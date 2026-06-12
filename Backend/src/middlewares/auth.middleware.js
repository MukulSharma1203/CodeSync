import jwt from "jsonwebtoken";

export const verifyJWT = (req,res,next)=>{
    try {
        const token = req.cookies?.accessToken;
        
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized request"
            });
        };

        const decodedToken = jwt.verify(
            token ,
            process.env.ACCESS_TOKEN_SECRET
        );

        req.user=decodedToken;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid access token"
        });
    }
}