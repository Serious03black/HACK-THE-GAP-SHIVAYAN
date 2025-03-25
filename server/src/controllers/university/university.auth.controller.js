import { uploadOnCloudinary } from "../../helper/cloudinary.js";
import { emptyFieldValidator } from "../../helper/emptyFieldValidator.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { University } from './../../models/university.model.js';


const options = {
    maxAge: 60 * 60 * 24 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
}


/*** Register the University */
const registerUniversity = asyncHandler( async (req, res, next) => {

    try {


        const {
            universityName,
            universityAddress,
            universityEmail,
            universityPhone,
            universityPassword, 
            
        } = req.body;
        
        /***
         *  Empty field Validations 
         */
        emptyFieldValidator(
            universityName,
            universityAddress,
            universityEmail,
            universityPhone,
            universityPassword
        )

        const existedUniversity = await University.findOne({
            $or: [
                {universityName: universityName},
                {universityEmail: universityEmail},
                {universityPhone: universityPhone}
            ]
        });

        if(existedUniversity) {
            throw new ApiError(400, "University already exists");
        }


        const response = await uploadOnCloudinary(req.file.path)

        console.log(response)

        const university = await University.create({
            universityName,
            universityAddress,
            universityEmail,
            universityPhone,
            universityPassword,
            universityLogo: {
                public_id : response.public_id,
                secure_url : response.secure_url
            }
        })
        

        return res
        .status(200)
        .json(
            new ApiResponse(
                201, 
                "university registered successfully", 
                {
                    university
                }
            )
        )

    } 
    catch (error) {
        throw new ApiError(400, error.message);
    }

}) 


/*** Login the University  */
const loginUniversity = asyncHandler( async (req, res, next) => {

    try {   

        

        const {
            universityEmail,
            universityPhone,
            universityPassword

        } = req.body;


       
        emptyFieldValidator(universityPassword);
       

        const university = await University.findOne({
            $or: [
                {universityEmail: universityEmail},
                {universityPhone: universityPhone}
            ]
        });
        
        if(!university) {
            throw new ApiError(400, "University not found");
        }


        if(!university.comparePassword(universityPassword)) {
            throw new ApiError(400, "Invalid password");
        }


        const access_token = university.generateJWTToken();

        console.log("access_token => ", access_token)

        return res
        .status(200)
        .cookie( "access_token", access_token, options)
        .json(
            new ApiResponse(
                200, 
                "University login successfully", 
                {
                    university
                }
            )
        )

        
    } 
    catch (error) {
        throw new ApiError(500, error?.message);    
    }
})

const getUniversityDetails = asyncHandler( async (req, res, next) => {

    try {
        const { _id } = req.university;

        const university = await University.findById(_id);

        if(!university) {
            throw new ApiError(404, "University not found");
        }

       
       
       return res
       .status(200)
       .json(
           new ApiResponse(
               200, 
               "University details retrieved successfully", 
               {
                   university
               }
           )
       )
    } 
    catch (error) {
        throw new ApiError(500, error.message)    
    }

})


const resetUniversityPassword = asyncHandler( async (req, res, next) => {

    try {
        
        const { universityEmail } = req.body;

        const universityDetails = await University.findOne({
            universityEmail
        })

        if(!universityDetails) {
            throw new ApiError(404, "University not found");
        }


        

        await universityDetails.save();

        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                "University password reset successfully", 
                {
                    universityDetails
                }
            )
        )

       

   } 
   catch (error) {
       throw new ApiError(500, error.message)    
   }

})




export {
    registerUniversity,
    loginUniversity,
    getUniversityDetails,
}