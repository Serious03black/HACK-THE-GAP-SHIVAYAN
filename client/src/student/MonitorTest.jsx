import { io } from "socket.io-client";
import * as blazeface from "@tensorflow-models/blazeface";

// Connect to the WebSocket server
const socket = io("http://localhost:3000");

const startExam = async () => {
    const video = document.getElementById("video");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        video.srcObject = stream;

        const peer = new RTCPeerConnection();
        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("offer", offer);

        peer.ontrack = (event) => {
            document.getElementById("adminVideo").srcObject = event.streams[0];
        };

        socket.on("answer", (answer) => peer.setRemoteDescription(answer));

        monitorCheating(video);
    } catch (error) {
        console.error("Error accessing camera:", error);
    }
};

// AI Face Detection to Monitor Cheating
const monitorCheating = async (video) => {
    const model = await blazeface.load();

    setInterval(async () => {
        const predictions = await model.estimateFaces(video, false);
        console.log("Faces detected:", predictions.length);

        if (predictions.length === 0) {
            alert("Warning! No face detected.");
        } else if (predictions.length > 1) {
            alert("Warning! Multiple faces detected. Possible cheating.");
        }
    }, 3000);
};

document.getElementById("startExam").addEventListener("click", startExam);
