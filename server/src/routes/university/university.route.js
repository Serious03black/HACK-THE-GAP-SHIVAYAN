import { Router } from "express";
import universityAuthRouter from "./university.auth.route.js";
import examRouter from "./university.exam.route.js";


const universityRouter = Router();

universityRouter.use("/auth", universityAuthRouter);
universityRouter.use("/exam", examRouter);



export default universityRouter;