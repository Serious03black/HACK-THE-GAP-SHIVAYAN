import { Student } from "../models/student.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt  from 'jsonwebtoken';


const isStudentLogin = asyncHandler( async (req, res, next) => {
    
    try {
        
        const access_token = req.cookies.access_token;

        if(!access_token) {
            throw new Error("Please login to access this route");
        }

        const response = await jwt.verify(access_token, process.env.JWT_ACCESS_TOKEN_SECRET);
        req.student = response;

        const student = await Student.findById(response._id);

        if(!student) {
            throw new Error("Student not found");
        }
        
        next();
    } 
    catch (error) {
        throw new ApiError(401, "Please login to access this route");
    }
    
})
   
export {
    isStudentLogin
}