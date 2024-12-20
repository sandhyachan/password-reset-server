const sgMail = require('@sendgrid/mail')
const { UserModel } = require("../model/User.Model");

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
        response.status(500).json({
            message: "Something went wrong"
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
                messsage: "Account not found"
            })
        }
    } catch (error) {
        response.status(500).json({
            message: "Something went wrong"
        })
    }
}

const userResetPassword = async (request, response) => {
    const EMAIL = request.body.email
    const PASSWORD = request.body.password
    
    const userExist = await UserModel.findOne({ email: EMAIL })
    
    if (!userExist) {
        return response.status(404).json({
            message: "Account not found! Please enter your registered email!"
        })
    }

    if (PASSWORD !== request.body.confirmPassword) {
        return response.status(400).json({
            message: "Please make sure your passwords match"
        })
    }

    try {
        await UserModel.updateOne(
            { _id: userExist._id },
            { $set: { password: PASSWORD } }
        )

        response.status(200).json({
            message: "Password updated successfully"
        })
    } catch (error) {
        console.error("Error during password reset:", error)
        response.status(500).json({
            message: "Something went wrong"
        })
    }
}

module.exports = { userSignUp, userLogin, userResetPassword }
