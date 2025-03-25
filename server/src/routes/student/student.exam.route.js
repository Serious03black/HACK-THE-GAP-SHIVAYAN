

import { Router } from "express";
import { getExamDetails, getMyExams } from "../../controllers/student/student.exam.controller.js";
import { isStudentLogin } from "../../middlewares/student.middleware.js";
import { upload } from './../../middlewares/multer.middleware.js';


const studentExamRouter = Router();

studentExamRouter.route("/getMyExams")
.get(
    isStudentLogin,
    upload.none(),
    getMyExams
);


studentExamRouter.route("/getExamDetails/:examId")
.get(
    isStudentLogin,
    upload.none(),
    getExamDetails
);


studentExamRouter.route("/submitQuestion/:examId")
.post(
    isStudentLogin,
    upload.none(),
    getExamDetails
);

studentExamRouter.route("/submitAnser/:examId")
.post(
    isStudentLogin,
    upload.none(),
    getExamDetails
);








export default studentExamRouter;