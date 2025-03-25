import mongoose from "mongoose";
import { StudentExam } from "../../models/student.exam.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { Exam } from './../../models/exam.model.js';
import { StudentAnswers } from "../../models/student.answers.model.js";



const getMyExams = asyncHandler(async (req, res, next) => {

    try {
        const { _id } = req.student;

        const exams = await Exam.find({
            students: new mongoose.Types.ObjectId(_id),
        })

        console.log("id :",_id);
        console.log("exams :",exams);

        return res
        .status(200)
        .json(      
            new ApiResponse(
                200, 
                "Exams retrieved successfully", 
                {
                    exams
                }
            )
        );
        
    } 
    catch (error) {
        throw new ApiError(500, error.message);
    }
    
})

const saveAnswers = asyncHandler(async (req, res, next) => {

    try {
        
        const { examId } = req.params;
        const {_id} = req.student;

        const { answerSheet } = req.body;

        const answers = await StudentExam.create({
            student: new mongoose.Types.ObjectId(_id),
            exam: new mongoose.Types.ObjectId(examId),
            answerSheet
        })
        

        return res
        .status(200)
        .json(      
            new ApiResponse(
                200, 
                "Exam submitted successfully", 
                {
                    answers
                }
            )
        );

    } 
    catch (error) {
        throw new ApiError(500, error.message);
    }

})


const viewExamResult = asyncHandler(async (req, res, next) => {
    try {

        const { examId } = req.params;
        const {_id} = req.student;

        const answerSheet = await StudentExam.aggregate([
            {
                $match: {
                    $and: [
                        {
                            student: new mongoose.Types.ObjectId(_id),
                        },
                        {
                            exam: new mongoose.Types.ObjectId(examId),
                        },
                    ]
                }
            },
            {
                $lookup: {
                    from: "questions",
                    localField: "exam",
                    foreignField: "exam",
                    as: "questions",

                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        "$questions.questionAnswer": "answer"
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
        ])



        return res
        .status(200)
        .json(      
        new ApiResponse(
            200, 
            "Exam result viewed successfully", 
            {
                answerSheet
            }
        )
        );
    } 
    catch (error) {
        throw new ApiError(500, error.message);
    }
});

const getStudentDashboard = asyncHandler(async (req, res, next) => {

    try {
        const { _id } = req.student;

        const dashboard = await Exam.aggregate([
            {
                $match: {
                    $and: [
                        {
                            student: new mongoose.Types.ObjectId(_id),
                        },
                    ]
                }
            },
            {
                $lookup: {
                    from: "answers",
                    localField: "_id",
                    foreignField: "exam",
                    as: "answers",

                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        "$answers.student": new mongoose.Types.ObjectId(_id),
                                    }
                                ]
                            }
                        },
                        {
                            $project: {
                                answers: 1,
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    exam: 1,
                    answers: 1,
                }
            }
        ])

        return res
        .status(200)
        .json(      
            new ApiResponse(
                200, 
                "Student dashboard retrieved successfully", 
                {
                    dashboard
                }
            )
        );
    } 
    catch (error) {
        throw new ApiError(500, error.message);
    }

})


const getExamDetails = asyncHandler(async (req, res, next) => {

    try {
        const { examId } = req.params;
        const { _id } = req.student;

        console.log("examId :",examId);
        console.log("_id :",_id);
        
        const exam = await Exam.aggregate([
            {
                $match: {
                    $and: [
                        {
                            _id: new mongoose.Types.ObjectId(examId),
                        },
                        {
                            students: new mongoose.Types.ObjectId(_id),
                        }
                    ]
                }
            },


            {
                $lookup: {
                    from: "questions",
                    localField: "_id",
                    foreignField: "exam",
                    as: "questions",
                }
            },

            {
                $addFields: {
                    questions: "$questions"
                }
            },

            {
                $project: {

                    examName: 1,
                    examCode: 1,
                    examDate: 1,
                    examTime: 1,
                    examDuration: 1,
                    duration: 1,
                    startDate: 1,
                    endDate: 1,
                    questions: 1,
                    createdBy: 1,
                    createdAt: 1,
                    updatedBy: 1,
                    updatedAt: 1,
                }
            }
        ])
    
        return res
        .status(200)
        .json(      
            new ApiResponse(
                200, 
                "Exam details retrieved successfully", 
                {
                    exam
                }
            )
        );
        
    } 
    catch (error) {
        throw new ApiError(500, error.message);
    }

})


const submitQuestion = asyncHandler(async (req, res, next) => {
    try {
        const { examId } = req.params;
        const {_id} = req.student;

        const { question } = req.body;

        const answer = await StudentAnswers.create({

            student: new mongoose.Types.ObjectId(_id),
            exam: new mongoose.Types.ObjectId(examId),
            question: new mongoose.Types.ObjectId(question._id),
            answerText: question.answerText,
            answerDuration: question.answerDuration,
            answerMarks: question.answerMarks,
            isCorrect: question.isCorrect,
            isAnswered: question.isAnswered,
            answerTime: question.answerTime,

        })
        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                "Question created successfully", 
                {
                    answer
                }
            )
        )
        
    } 
    catch (error) {
        throw new ApiError(500, error.message)
    }
})


const submitExam = asyncHandler(async (req, res, next) => {
    try {
        const { examId } = req.params;
        const {_id} = req.student;

        const { answerSheet } = req.body;

        const answers = await StudentExam.create({
            student: new mongoose.Types.ObjectId(_id),
            exam: new mongoose.Types.ObjectId(examId),
            answerSheet
        })
        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                "Exam submitted successfully", 
                {
                    answers
                }
            )
        )
            
    } 
    catch (error) {
        throw new ApiError(500, error.message)
    }
})


export {
    getMyExams,
    submitExam,
    viewExamResult,
    getExamDetails
};