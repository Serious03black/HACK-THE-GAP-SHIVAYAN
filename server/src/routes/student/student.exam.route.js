

import { Router } from "express";
import { attemptedExam, getExamDetails, getExamResult, getMyExams, submitExam, submitMCQAnswer } from "../../controllers/student/student.exam.controller.js";
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


studentExamRouter.route("/submitMCQAnswer/:examId")
.post(
    isStudentLogin,
    upload.none(),
    submitMCQAnswer
);



/***  Submit the Exams  */

studentExamRouter.route("/submitExam/:examId")
.post(
    isStudentLogin,
    upload.none(),
    submitExam
);


studentExamRouter.route("/viewExamResult/:examId")
.get(
    isStudentLogin,
    upload.none(),
    getExamResult
);

studentExamRouter.route("/attemptedExam")
.get(
    isStudentLogin,
    upload.none(),
    attemptedExam
);



export default studentExamRouter;