import { ApiError } from "../utils/ApiError.js";

const emptyFieldValidator = (...body) => {

    body.forEach(field  => {
        if(field === "") {
            throw new ApiError(401, "Please fill all the fields");
        }
    })
}

export {
    emptyFieldValidator
}