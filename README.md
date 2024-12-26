# Elysian Shores - Backend

This is the backend for the **Elysian Shores** project, responsible for handling user authentication, password reset, and managing user data. The server is built using **Node.js** and **Express**, with a **MongoDB** database.

## Technologies Used
- **Node.js**: JavaScript runtime for the server.
- **Express.js**: Web framework for building REST APIs.
- **MongoDB**: NoSQL database for storing user information.
- **Mongoose**: ODM for MongoDB to define models and interact with the database.
- **SendGrid**: Service for sending password reset emails.
- **Crypto**: For generating secure reset tokens.

## API Routes

- **POST /signup**: User registration.
- **POST /login**: User login.
- **POST /forgotpassword**: Request a password reset.
- **POST /resetpassword**: Reset the password using a token.


## Running the Application
To start the server, run:

```npm start```

The server will run on http://localhost:3000.

## License
This project is licensed under the MIT License - see the LICENSE file for details.