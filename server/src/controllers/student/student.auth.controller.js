import { Student} from "../../models/student.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { emptyFieldValidator } from "../../helper/emptyFieldValidator.js";
import { uploadOnCloudinary } from "../../helper/cloudinary.js";


const options = {
    maxAge: 60 * 60 * 24 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
}

// Create a new student
const registerStudent = asyncHandler(async (req, res, next) => {
  try {

    const {
      studentName,
      studentEmail,
      studentPassword,
      studentPhone,
    } = req.body;

    console.log("req.file => ", req.file);

    emptyFieldValidator(studentName, studentEmail, studentPassword, studentPhone);

    const existedStudent = await Student.findOne({
      studentEmail,
      studentPhone
    })

    if(existedStudent) {
      throw new ApiError(400, "Student already exists");
    }

    const response = await uploadOnCloudinary(req.file.path)

    console.log(response)

    const student = await Student.create({
      studentName,
      studentEmail,
      studentPassword,
      studentPhone,
      studentPhoto: {
        public_id : response.public_id,
        secure_url : response.secure_url
      }
 
    })

    

    return res.status(201).json(
      new ApiResponse(201, "Student created successfully", {student})
    );
  } 
  catch (error) {
    throw new ApiError(500, error.message);
  }
});




// Get the profile of the logged-in student
const loginStudent = asyncHandler(async (req, res, next) => {
  try {

    const {
      studentEmail,
      studentPhone,
      studentPassword
    } = req.body;
    
    emptyFieldValidator(studentPassword);
    
    const student = await Student.findOne({
      $or: [
        {studentEmail: studentEmail},
        {studentPhone: studentPhone}
      ]
    });
    
    if(!student) {
      throw new ApiError(400, "Student not found");
    }

    if(!student.comparePassword(studentPassword)) {
      throw new ApiError(400, "Invalid password");
    }
    
    const access_token = student.generateJWTToken();

    return res
    .status(200)
    .cookie( "access_token", access_token, options)
    .json(
      new ApiResponse(200, "Student profile retrieved successfully", {student})
    );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});



const getStudentProfile = asyncHandler(async (req, res, next) => {

  try {
    
    const { _id } = req.student;

    const student = await Student.findById(_id);

    if(!student) {
      throw new ApiError(404, "Student not found");
    }

    return res
    .status(200)
    .json(
      new ApiResponse(200, "Student profile retrieved successfully", {student})
    );

  } 
  catch (error) {
    throw new ApiError(500, error.message)
  }

})


// Export all controllers
export {
  registerStudent,
  loginStudent,
  getStudentProfile,

};