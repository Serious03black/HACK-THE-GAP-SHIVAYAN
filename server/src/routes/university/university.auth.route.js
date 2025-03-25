
import { Router } from 'express';
import { getUniversityDetails, loginUniversity, registerUniversity } from '../../controllers/university/university.auth.controller.js';
import { upload } from './../../middlewares/multer.middleware.js';
import { isUniversityLogin } from './../../middlewares/university.middleware.js';

const universityAuthRouter = Router();


universityAuthRouter.route("/register")
.post(
    upload.single("logo"),
    registerUniversity
)

universityAuthRouter.route("/login")
.post(
    upload.none(),
    loginUniversity
)


// route to get all the university details
universityAuthRouter.route("/getUniversityDetails")
.get(
    isUniversityLogin,
    getUniversityDetails
)


export default universityAuthRouter;