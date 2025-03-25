
class ApiError extends Error {
    constructor(
        statusCode = 400,
        message = "Something went wrong",
        stack,
        data = null,
    ) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.message = message;

        if(this.stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }

        console.log("Error => ", message)
    }
}


export {
    ApiError
}