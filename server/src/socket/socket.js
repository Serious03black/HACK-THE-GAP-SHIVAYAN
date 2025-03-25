import { Server } from "socket.io";
import http from 'http';
import app from '../app.js';
import { startExam } from "./events/exam.events.js";


const server = http.createServer(app);


const allowOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

export const io = new Server(server, {
    cors: {
        origin: allowOrigins,
        credentials: true,
    }
});

/**
 *  Live Streaming of the video and audio of the test 
 * 
*/
startExam();







export default server;

