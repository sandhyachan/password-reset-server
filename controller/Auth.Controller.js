const sgMail = require('@sendgrid/mail')
const { UserModel } = require("../model/User.Model");
const crypto = require('crypto');
const { response } = require('express');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const generateResetToken = () => {
    return crypto.randomBytes(20).toString('hex')
}

const userSignUp = async (request, response) => {
    if(!request.body.email || !request.body.password || !request.body.fullName || !request.body.phoneNumber){
        return response.status(400).json({
            message: "Please enter all the required fields."
        })
    }
    try {
        const emailExists = await UserModel.findOne({email: request.body.email})
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

const userLogin = async (request, response) => {
    if(!request.body.email || !request.body.password){
        return response.status(400).json({
            message: "Bad Credentials"
        })
    }
    try {
        const userExist = await UserModel.findOne({email: request.body.email})
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

const userResetPassword = async (request, response) => {
    const { token, newPassword, confirmPassword } = request.body

    const user = await UserModel.findOne({ resetToken: token })
    if (!user) {
        return response.status(404).json({ message: 'Invalid or expired reset token!' })
    }

    if (Date.now() > user.tokenExpiration) {
        return response.status(400).json({ message: 'Reset token has expired!' })
    }

    if (newPassword !== confirmPassword) {
        return response.status(400).json({ message: 'Passwords do not match!' })
    }

    user.password = newPassword 
    user.resetToken = undefined 
    user.tokenExpiration = undefined 
    await user.save()

    return response.status(200).json({ message: 'Password reset successful!' })
}

const forgotPassword = async (request, response) => {
    const { email } = request.body

    const user = await UserModel.findOne({ email })
    if (!user) {
        return response.status(404).json({ message: 'Account not found!' })
    }

    const resetToken = generateResetToken()
    const tokenExpiration = Date.now() + 3600000

    user.resetToken = resetToken
    user.tokenExpiration = tokenExpiration
    await user.save()

    const resetLink = `https://yourfrontendurl.com/reset-password?token=${resetToken}`

    const msg = {
        to: email,
        from: 'honeycoupleart@gmail.com',
        subject: 'Password Reset Request',
        text: `Click the link below to reset your password (this link will expire in 1 hour):\n\n${resetLink}`,
        html: `<p>Click the link below to reset your password (this link will expire in 1 hour):</p><a href="${resetLink}">Reset Password</a>`
    }

    try {
        await sgMail.send(msg)
        return response.status(200).json({ message: 'Password reset email sent!' })
    } catch (error) {
        console.error('Error sending email:', error);
    response.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }
}


module.exports = { userSignUp, userLogin, userResetPassword, forgotPassword }
