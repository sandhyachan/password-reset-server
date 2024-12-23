const mongoose = require('mongoose')

// MongoDB connection
const connectDB = async (request, response) => {
    try {
        const connection = await mongoose.connect("mongodb+srv://sandhyachan:Password123@cluster0.ahjkd.mongodb.net/ElysianShores?retryWrites=true&w=majority&appName=Cluster0", { serverSelectionTimeoutMS: 30000})
        if(connection){
            console.log("DB connection successful")
        } else {
            throw new Error("DB connection could not be established")
        }
    } catch (error) {
        console.log("DB connection error:", error.message)
    }
}

module.exports = { connectDB }
