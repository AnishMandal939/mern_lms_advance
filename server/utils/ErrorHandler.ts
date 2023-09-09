// create a class to handle errors - because we want to use this class in other files - OOP concept - inheritance - extends Error   -  Error is a built-in class in Node.js
class ErrorHandler extends Error {
    statusCode: Number;
    constructor(message: any, statusCode:Number) {
        super(message); // message is a built-in property of Error class
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor); // this will capture the stack trace of the error

    }
}
export default ErrorHandler;