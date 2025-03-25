import { Schema, model } from 'mongoose';

const questionSchema = new Schema({

    questionType: {
        type: String,
        required: true,
        enum: ['MCQ', 'short_answer', 'essay', 'OA', 'other'],
    },

    exam: {
        type: Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
    },

    questionTitle: {
        type: String,
        required: true,
    },

    questionDescription: {
        type: String,
        required: true,
    },

    questionOptions: [{
        type: String,

    }],

    questionOutput: {
        type: String,

    },

    questionAnswer: {
        type: String,
        // required: true,
    },

    questionMarks: {
        type: Number,
        required: true,
    },

    questionLevel: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard'],
    }


}, 
{
  timestamps  : true
})


export const Question = model('Question', questionSchema);