const mongoose = require('mongoose')

// User model schema
const UserSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: { 
        type: String, 
        required: false 
    },
    tokenExpiration: { 
        type: Date, 
        required: false 
    }
})

const UserModel = mongoose.model('users', UserSchema)

module.exports = {UserModel}