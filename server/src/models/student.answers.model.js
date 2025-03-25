

import { Schema, model } from 'mongoose';

const studentAnswersSchema = new Schema({

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
    
    question: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
    },

    answerText: {
        type: String,
        required: true,
    },

    answerDuration: {
        type: Number,
        required: true,
    },

    answerMarks: {
        type: Number,
        required: true,
    },

    isCorrect: {
        type: Boolean,
        required: true,
    },

    isAnswered: {
        type: Boolean,
        required: true,
    },

    answerTime: {
        type: Date,
        required: true,
    },


  
})

export const StudentAnswers = model('StudentAnswers', studentAnswersSchema);