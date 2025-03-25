
import { Schema, model } from 'mongoose';

const studentExamSchema = new Schema({

    student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    
    exam: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
    },
    
    answers: {
        type: Schema.Types.ObjectId,
        ref: "StudentAnswers",
        required: true,
    },

    examStatus: {
        type: String,
        enum: ["pending", "passed", "failed"]
    },

    examScore: {
        type: Number,
        required: true,
    },

    examMarks: {
        type: Number,
        required: true,
    },

    examDurationByStudent: {
        type: Number,
        required: true,
    },

    totalQuestionsSolved: {
        type: Number,
        default: 0,
    },

    



    
})


export const StudentExam = model('StudentExam', studentExamSchema);