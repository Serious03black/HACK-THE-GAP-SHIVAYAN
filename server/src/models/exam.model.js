import { Schema, model } from 'mongoose';

const examSchema = new Schema({

    university: {
        type: Schema.Types.ObjectId,
        ref: "University",
        required: true,
    },

    examName: {
        type: String,
        required: true,
    },

    examDate: {
        type: String,
        required: true,
    },

    examTime: {
        type: String,
        required: true,
    },

    examQualification: {
        type: String,
        required: true,
    },

    examType: {
        type: String,
        required: true,
        enum: ['MCQ', 'short_answer', 'essay', 'OA', 'other'],
    },

    examDuration: {
        type: Number,
        required: true,
    },

    examMarks: {
        type: Number,
        // required: true,
    },
    
    examDescription: {
        type: String,
        required: true,
    },


    students: [{
        type: Schema.Types.ObjectId,
        ref: "Student",
    }],




}, {
    timestamps  : true
})


export const Exam = model('Exam', examSchema);