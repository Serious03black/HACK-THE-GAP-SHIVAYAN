import { Router } from "express";
import universityRouter from "./university/university.route.js";
import studentRouter from "./student/student.route.js";

const connectRouter = Router();



connectRouter.use("/university", universityRouter);
connectRouter.use("/student", studentRouter);


export default connectRouter;