import ffmpeg from 'fluent-ffmpeg';

ffmpeg()
  .input('rtmp://your-stream-url')
  .outputOptions("-c:v copy")
  .output("recorded_video.mp4")
  .on("end", () => console.log("Recording finished"))
  .run();


  