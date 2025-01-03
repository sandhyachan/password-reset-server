const express = require('express')
const cors = require('cors')
const { userSignUp, userLogin, userResetPassword, forgotPassword } = require('./controller/Auth.Controller')
const { UserModel } = require('./model/User.Model')
const { connectDB } = require('./dbConfig')
const server = express()
connectDB()

// Middleware and routes setup
server.use(express.json())
server.use(cors())

//ROUTE HANDLERS
server.post('/signup', userSignUp)

server.post('/login', userLogin)

server.post('/resetpassword', userResetPassword)

server.post('/forgotpassword', forgotPassword)

//Endpoint to fetch all users
server.get('/', async (request, response) => {
    try {
        const result = await UserModel.find()
        response.status(200).json({
            message: "Registered users fetched successfully",
            data: result
        })
    } catch (error) {
        response.status(400).json({
            message: "Something went wrong",
            error: error.message,
        })
    }
})

// Start the server
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000")
})