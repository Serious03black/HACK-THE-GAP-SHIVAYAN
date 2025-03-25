import mongoose from "mongoose";
import { StudentExam } from "../../models/student.exam.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { Exam } from "../../models/exam.model.js";
import { StudentAnswers } from "../../models/student.answers.model.js";
import { Question } from "../../models/question.model.js";
import { emptyFieldValidator } from "../../helper/emptyFieldValidator.js";

const getMyExams = asyncHandler(async (req, res) => {
  const { _id } = req.student;

  const exams = await Exam.find({ students: new mongoose.Types.ObjectId(_id) });

  console.log("Student ID:", _id);
  console.log("Exams:", exams);

  return res.status(200).json(
    new ApiResponse(200, "Exams retrieved successfully", { exams })
  );
});

const saveAnswers = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { _id } = req.student;
  const { answerSheet } = req.body;

  if (!answerSheet) {
    throw new ApiError(400, "Answer sheet is required");
  }

  const answers = await StudentExam.create({
    student: new mongoose.Types.ObjectId(_id),
    exam: new mongoose.Types.ObjectId(examId),
    answerSheet,
  });

  return res.status(200).json(
    new ApiResponse(200, "Answers saved successfully", { answers })
  );
});

const viewExamResult = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { _id } = req.student;

  const answerSheet = await StudentExam.aggregate([
    {
      $match: {
        $and: [
          { student: new mongoose.Types.ObjectId(_id) },
          { exam: new mongoose.Types.ObjectId(examId) },
        ],
      },
    },
    {
      $lookup: {
        from: "questions",
        localField: "exam",
        foreignField: "exam",
        as: "questions",
      },
    },
    // Removed invalid pipeline in $lookup - "$questions.questionAnswer" syntax was incorrect
  ]);

  if (!answerSheet.length) {
    throw new ApiError(404, "No results found for this exam");
  }

  return res.status(200).json(
    new ApiResponse(200, "Exam result retrieved successfully", { answerSheet })
  );
});

const getStudentDashboard = asyncHandler(async (req, res) => {
  const { _id } = req.student;

  const dashboard = await Exam.aggregate([
    {
      $match: { students: new mongoose.Types.ObjectId(_id) }, // Fixed "student" to "students"
    },
    {
      $lookup: {
        from: "studentanswers", // Corrected collection name to match StudentAnswers model
        localField: "_id",
        foreignField: "exam",
        as: "answers",
        pipeline: [
          {
            $match: { student: new mongoose.Types.ObjectId(_id) },
          },
          {
            $project: { answerText: 1, isCorrect: 1, answerMarks: 1 },
          },
        ],
      },
    },
    {
      $project: {
        examName: 1,
        examDate: 1,
        examDuration: 1,
        answers: 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Student dashboard retrieved successfully", { dashboard })
  );
});

const getExamDetails = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { _id } = req.student;

  console.log("Exam ID:", examId);
  console.log("Student ID:", _id);

  const exam = await Exam.aggregate([
    {
      $match: {
        $and: [
          { _id: new mongoose.Types.ObjectId(examId) },
          { students: new mongoose.Types.ObjectId(_id) },
        ],
      },
    },
    {
      $lookup: {
        from: "questions",
        localField: "_id",
        foreignField: "exam",
        as: "questions",
      },
    },
    {
      $project: {
        examName: 1,
        examCode: 1,
        examDate: 1,
        examTime: 1,
        examDuration: 1,
        startDate: 1,
        endDate: 1,
        questions: 1,
        createdBy: 1,
        createdAt: 1,
        updatedBy: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!exam.length) {
    throw new ApiError(404, "Exam not found or student not enrolled");
  }

  return res.status(200).json(
    new ApiResponse(200, "Exam details retrieved successfully", { exam })
  );
});

const submitMCQAnswer = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { _id } = req.student;
  const { questionId, answerText, answerDuration, answerMarks, isAnswered, answerTime } = req.body;

  console.log("Request Body:", req.body);

  emptyFieldValidator(answerText, answerDuration, answerMarks, isAnswered, answerTime);

  const question = await Question.findOne({
    _id: new mongoose.Types.ObjectId(questionId),
    exam: new mongoose.Types.ObjectId(examId),
  });

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  const existedAnswer = await StudentAnswers.findOne({
    student: new mongoose.Types.ObjectId(_id),
    exam: new mongoose.Types.ObjectId(examId),
    question: new mongoose.Types.ObjectId(question._id),
  });

  if (existedAnswer) {
    existedAnswer.answerText = answerText;
    existedAnswer.answerDuration = answerDuration;
    existedAnswer.answerMarks = answerMarks;
    existedAnswer.isAnswered = isAnswered;
    existedAnswer.answerTime = answerTime;
    existedAnswer.isCorrect = question.questionAnswer === answerText;

    await existedAnswer.save();

    return res.status(200).json(
      new ApiResponse(200, "MCQ answer updated successfully", { answer: existedAnswer })
    );
  }

  const isCorrect = question.questionAnswer === answerText;
  const answerScore = isCorrect ? question.questionMarks : 0;

  const answer = await StudentAnswers.create({
    student: new mongoose.Types.ObjectId(_id),
    exam: new mongoose.Types.ObjectId(examId),
    question: new mongoose.Types.ObjectId(question._id),
    answerText,
    answerDuration,
    answerMarks: answerScore,
    isCorrect,
    isAnswered,
    answerTime,
  });

  return res.status(200).json(
    new ApiResponse(200, "MCQ answer submitted successfully", { answer })
  );
});

const submitExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { _id } = req.student;
  const { examDurationByStudent } = req.body; // Optional: sent from frontend

  const existedExam = await StudentExam.findOne({
    student: new mongoose.Types.ObjectId(_id),
    exam: new mongoose.Types.ObjectId(examId),
  });

  if (existedExam) {
    return res.status(200).json(
      new ApiResponse(200, "Exam already submitted", { answers: existedExam })
    );
  }

  const questionAnswers = await StudentAnswers.aggregate([
    {
      $match: {
        $and: [
          { student: new mongoose.Types.ObjectId(_id) },
          { exam: new mongoose.Types.ObjectId(examId) },
        ],
      },
    },
  ]);

  let totalMarks = 0;
  const totalQuestionsSolved = questionAnswers.length;
  const examStatus = "pending";

  questionAnswers.forEach((doc) => (totalMarks += doc.answerMarks));

        console.log("totalMarks => ", totalMarks);

        const existedExam = await StudentExam.find({
            student: new mongoose.Types.ObjectId(_id),
            exam: new mongoose.Types.ObjectId(examId),
        })

        if(existedExam) {
            return res.status(200)
            .json(
                new ApiResponse(
                    200, 
                    "Exam submitted successfully", 
                    {
                        answers : existedExam
                    }
                )
            )
        }


  const answers = await StudentExam.create({
    student: new mongoose.Types.ObjectId(_id),
    exam: new mongoose.Types.ObjectId(examId),
    examStatus,
    examScore: totalMarks,
    examDurationByStudent: examDurationByStudent || 1, // Use frontend value or default
    totalQuestionsSolved,
  });

  return res.status(200).json(
    new ApiResponse(200, "Exam submitted successfully", { answers })
  );
});

const attemptedExam = asyncHandler(async (req, res, next) => {
    try {
      const { _id } = req.student;
  
      const exams = await StudentAnswers.aggregate([
        {
          $match: {
            student: new mongoose.Types.ObjectId(_id),
            
          },
        },
        {
          $group: {
            _id: "$exam",
            totalScore: { $sum: { $cond: ["$isCorrect", "$answerMarks", 0] } },
            totalQuestions: { $sum: 1 },
            completedDate: { $max: "$answerTime" },
            answers: { $push: "$$ROOT" }, // Keep all answers for reference
          },
        },
        {
          $lookup: {
            from: "exams",
            localField: "_id",
            foreignField: "_id",
            as: "examDetails",
          },
        },
        { $unwind: "$examDetails" },
        {
          $lookup: {
            from: "universities",
            localField: "examDetails.university",
            foreignField: "_id",
            as: "universityDetails",
          },
        },
        { $unwind: "$universityDetails" },
        {
          $project: {
            examId: "$_id",
            examName: "$examDetails.examName",
            universityName: "$universityDetails.universityName",
            totalScore: 1,
            totalMarks: "$examDetails.examMarks",
            completedDate: 1,
            totalQuestions: 1,
            status: "Completed", // Assuming completed since it's in history
          },
        },
      ]);
  
      return res.status(200).json(
        new ApiResponse(200, "Exams attempted successfully", { exams })
      );
    } catch (error) {
      throw new ApiError(500, error.message);
    }
  });


const getExamResult = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { _id } = req.student;


        console.log("examId => ", examId);
        console.log("_id => ", _id);

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
            // {
            //     $lookup: {
            //         from: "studentanswers",
            //         localField: "exam",
            //         foreignField: "exam",
            //         as: "studentanswers",
            //     }
            // },

            // {
            //     $lookup: {
            //         from: "questions",
            //         localField: "exam",
            //         foreignField: "exam",
            //         as: "questions",
            //     }
            // },

            // {
            //     $addFields: {
            //         questions: "$questions",
            //         studentanswers: "$studentanswers"
            //     }
            // },


            // {
            //     $project: {
            //         _id: 1,
            //         student: 1,
            //         exam: 1,

            //         answers: 1,
            //         totalQuestionsSolved: 1,
            //         examStatus: 1,
            //         examScore: 1,
            //         examDurationByStudent: 1,


            //         questions: 1,
            //         studentanswers: 1,
            //     }
            // }
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




export {
  getMyExams,
  saveAnswers, // Added to exports
  submitExam,
  viewExamResult,
  getStudentDashboard, // Added to exports
  getExamDetails,
  submitMCQAnswer,
  getExamResult,
  attemptedExam,
};