//import necessary modules
const sgMail = require('@sendgrid/mail')
const { UserModel } = require("../model/User.Model")
const crypto = require('crypto')
const { response } = require('express')

require('dotenv').config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY) // Set SendGrid API key

// Generate a random reset token
const generateResetToken = () => {
    return crypto.randomBytes(20).toString('hex')
}

// User sign up function
const userSignUp = async (request, response) => {
    const PASSWORD = request.body.password

    //check if the required fields are provided
    if(!request.body.email || !PASSWORD || !request.body.fullName || !request.body.phoneNumber){
        return response.status(400).json({
            message: "Please enter all the required fields."
        })
    }
    //password validation
    if(PASSWORD.length<6){
        return response.status(400).json({
            message: "Password length must be atleast 6 characters!"
        })
    }
    try {
        const emailExists = await UserModel.findOne({email: request.body.email})
        //check if email already exists
        if(emailExists){
            return response.status(409).json({
                message: "Account already exists. Please log in to your account."
            })
        } else {
            const newUser = new UserModel({
                fullName: request.body.fullName,
                phoneNumber: request.body.phoneNumber,
                email: request.body.email,
                password: request.body.password
            })
            const result = await newUser.save()
            response.status(201).json({
                message: "Account created successfully",
                data: result
            })
        }
    } catch (error) {
        console.error(error)
        response.status(500).json({
            message: "Something went wrong",
            error: error.message
        })
    }
}

// User login function
const userLogin = async (request, response) => {
    if(!request.body.email || !request.body.password){
        return response.status(400).json({
            message: "Bad Credentials"
        })
    }
    try {
        const userExist = await UserModel.findOne({email: request.body.email})
        // Check if user exists and verify password
        if(userExist){
            if (request.body.password === userExist.password){
                response.status(200).json({
                    message: "Login successfull"
                })
            } else {
                response.status(400).json({
                    message: "Bad Credentials"})
            }
        } else {
            response.status(404).json({
                message: "Account not found"
            })
        }
    } catch (error) {
        response.status(500).json({
            message: "Something went wrong"
        })
    }
}

// Forgot password function
const forgotPassword = async (request, response) => {
    const { email } = request.body

    // Check if user exists
    const user = await UserModel.findOne({ email })
    if (!user) {
        return response.status(404).json({ message: 'Account not found!' })
    }

    // Generate reset token and set expiration
    const resetToken = generateResetToken()
    const tokenExpiration = Date.now() + 3600000  // Token expires in 1 hour

    user.resetToken = resetToken
    user.tokenExpiration = tokenExpiration
    await user.save()

    // Reset link with token for user to reset their password
    const resetLink = `https://localhost:3000/resetpassword`

    const msg = {
        to: email,
        from: 'honeycoupleart@gmail.com',
        subject: 'Password Reset Request',
        text: `Click the link below to reset your password (this link will expire in 1 hour):\n\n${resetLink}. Copy your reset token from here for verification. ${resetToken}`,
        html: `
        <p>Click the link below to reset your password (this link will expire in 1 hour):</p>
        <a href="${resetLink}">Reset Password</a>
        <p>Copy your reset token from here for verification.</p>
        <h6>${resetToken}</h6>`
    }

    try {
        console.log('Sending email to:', email)

        // Send password reset email
        await sgMail.send(msg)

        return response.status(200).json({ message: 'Password reset email sent!' })
    } catch (error) {
        console.error('Error sending email:', error.response ? error.response.body : error.message)
        return response.status(500).json({
            message: 'Failed to send reset email. Please try again later.',
            error: error.response ? error.response.body : error.message,
        })
    }
}

//User password reset function
const userResetPassword = async (request, response) => {
    const { token, newPassword, confirmPassword } = request.body

    // Check if token is valid
    const user = await UserModel.findOne({ resetToken: token })
    if (!user) {
        return response.status(404).json({ message: 'Invalid or expired reset token!'})
    }

    //Check if token has expired
    if (Date.now() > user.tokenExpiration) {
        return response.status(400).json({ message: 'Reset token has expired!'})
    }

    //Validate new password
    if (newPassword.length<6) {
        return response.status(400).json({ message: 'Passwords must have atleast 6 characters!'})
    }

    //Ensure new password match
    if (newPassword !== confirmPassword) {
        return response.status(400).json({ message: 'Passwords do not match!'})
    }

    //Reset password and clear token data
    user.password = newPassword 
    user.resetToken = undefined 
    user.tokenExpiration = undefined 
    await user.save()

    return response.status(200).json({ message: 'Password reset successful!' })
}



module.exports = { userSignUp, userLogin, userResetPassword, forgotPassword }
