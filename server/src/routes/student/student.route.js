import { Router } from "express";
import studentAuthRouter from "./student.auth.routes.js";
import studentExamRouter from './student.exam.route.js';


const studentRouter = Router();



studentRouter.use("/auth", studentAuthRouter);
studentRouter.use("/exam", studentExamRouter);


export default studentRouter;