import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApiError } from './utils/ApiError.js';
import { asyncHandler } from './utils/AsyncHandler.js';
import connectRouter from './routes/connect.router.js';

const app = express();


app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const allowOrigins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:5173",
]

app.use(cors({
    origin : allowOrigins,
    credentials : true,
}));



app.get('/', (req, res) => {

    return res
    .send('Hello World! from our server ');
});


app.get('/health', asyncHandler( async (req, res) => {
    
    return res
    .status(200)
    .send('Server is health is good now you can check any routes');
}));



app.use("/api/v1", connectRouter);


app.use("*", asyncHandler( async (req, res) => {
    throw new ApiError(404, "this path is not available on server")
}));


export default app;