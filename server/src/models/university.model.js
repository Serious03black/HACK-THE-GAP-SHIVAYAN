import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const universitySchema = new Schema({



    universityName: {
        type: String,
        required: true,
    },

    universityAddress: {
        type: String,
    },

    universityEmail: {
        type: String,
        required: true,
    },

    universityPhone: {
        type: String,
        required: true,
    },

    universityPassword: {
        type: String,
        required: true,

    },

    universityLogo: {
        public_id: {
            type: String,
            required: true
        },

        secure_url: {
            type: String,
            required: true
        }
    }


})


universitySchema.pre('save', async function(next) {

    if(this.isModified("universityPassword")) {
        this.universityPassword = await bcrypt.hash(this.universityPassword, 10);
    }

    next();
})

universitySchema.methods = {

    async comparePassword(password) {
        return await bcrypt.compare(password, this.universityPassword);
    },

    generateJWTToken() {

        console.log(process.env.JWT_ACCESS_TOKEN_SECRET)

        return jwt.sign(
            {
                _id: this._id,
                universityName: this.universityName,
                universityEmail: this.universityEmail,
                universityPhone: this.universityPhone,
                universityAddress: this.universityAddress,
            },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            {
                expiresIn: "24h"
            }
        )
    }
}


export const University = model('University', universitySchema);