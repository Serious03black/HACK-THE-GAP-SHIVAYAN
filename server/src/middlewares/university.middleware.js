import { University } from "../models/university.model.js";
import { ApiError } from "../utils/ApiError.js";
import  jwt  from 'jsonwebtoken';
import { asyncHandler } from "../utils/AsyncHandler.js";

const isUniversityLogin = asyncHandler( async (req, res, next) => {
 

    try {
        
        const access_token = req.cookies.access_token;

        if(!access_token) {
            throw new ApiError(401, "Please login to access this route");
        }

        const response = await jwt.verify(access_token, process.env.JWT_ACCESS_TOKEN_SECRET);
        req.university = response;

        const university = await University.findById(response._id);

        if(!university) {
            throw new ApiError(401, "University not found");
        }
        

        next();
    } 
    catch (error) {
        throw new ApiError(401, "Please login to access this route");
    }
    
})

export {
    isUniversityLogin
}