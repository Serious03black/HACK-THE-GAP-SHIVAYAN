import { Router } from "express";
import { upload } from './../../middlewares/multer.middleware.js';
import { loginStudent, registerStudent, getStudentProfile } from "../../controllers/student/student.auth.controller.js";
import { isStudentLogin } from "../../middlewares/student.middleware.js";
const studentAuthRouter = Router();



studentAuthRouter.route("/register")
  .post(
    upload.single("photo"),
    registerStudent
  )

studentAuthRouter.route("/login")
.post(
  upload.none(),
  loginStudent
)

studentAuthRouter.route("/getProfile")
.get(
  isStudentLogin,
  getStudentProfile
)



export default studentAuthRouter;