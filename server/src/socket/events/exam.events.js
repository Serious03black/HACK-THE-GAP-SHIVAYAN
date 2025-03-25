
import { io } from './../socket.js';

const startExam = () => {

    io.on("startExam", (socket) => {
        
        console.log("User connected:", socket.id);

        socket.on("offer", (offer) => {
            socket.broadcast.emit("offer", offer);
        });

        socket.on("answer", (answer) => {
            socket.broadcast.emit("answer", answer);
        });

        socket.on("candidate", (candidate) => {
            socket.broadcast.emit("candidate", candidate);
        });
    });

}


const streamStart = async () => {
    io.on("connection", (socket) => {
        console.log("Student connected:", socket.id);
    
        socket.on("offer", (offer) => {
            socket.broadcast.emit("offer", offer);
        });
    
        socket.on("answer", (answer) => {
            socket.broadcast.emit("answer", answer);
        });
    
        socket.on("candidate", (candidate) => {
            socket.broadcast.emit("candidate", candidate);
        });
    
        socket.on("disconnect", () => console.log("Student disconnected:", socket.id));
    });;
}

export {
    startExam
}