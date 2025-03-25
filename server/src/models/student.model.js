import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const studentSchema = new Schema({

    studentName: {
        type: String,
        required: true,
    },

    studentEmail: {
        type: String,
        required: true,
    },

    studentPassword: {
        type: String,
        required: true,
    },

    studentPhone: {
        type: String,
        // required: true,
    }, 

    studentAddress: {
        type: String,
       // required: true,
    },

    studentPhoto: {
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },


    studentRollNo: {
        type: String,
        // required: true,
    },

    studentCouse: {
        type: String,

    },


    studentGraduationYear: {
        type: String,
        // required: true,
    },

    


}, 
{
    timestamps  : true
})


studentSchema.pre('save', async function(next) {

  if(this.isModified("studentPassword")) {
      this.studentPassword = await bcrypt.hash(this.studentPassword, 10);
  }

  next();
})

studentSchema.methods = {

    async comparePassword(password) {
        return await bcrypt.compare(password, this.studentPassword);
    },

    generateJWTToken() {

        return jwt.sign(
            {
                _id: this._id,
                studentName: this.studentName,
                studentEmail: this.studentEmail,
                studentPhone: this.studentPhone,
                studentAddress: this.studentAddress,
            },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            {
                expiresIn: "24h"
            }
        )
    }
}

export const Student = model('Student', studentSchema);
