
class ApiResponse {

    constructor(
        statusCode,
        message,
        data,
    ) {
        

        this.statusCode = statusCode;
        this.data = data;
        this.message = message;

    }
    
}

export {
    ApiResponse
}