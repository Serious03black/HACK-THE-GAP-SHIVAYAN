import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from './../../services/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

const StartTest = ({ onStartTest }) => {
  const [inputValue, setInputValue] = useState('');
  const [cameraStatus, setCameraStatus] = useState('unchecked');
  const [micStatus, setMicStatus] = useState('unchecked');
  const [error, setError] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [cameraCount, setCameraCount] = useState(0);
  const [cameraList, setCameraList] = useState([]);
  const [isCompatible, setIsCompatible] = useState(false);
  const [studentPhotoUrl, setStudentPhotoUrl] = useState('');
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(''); // Store captured photo
  const [showFaceComparison, setShowFaceComparison] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // For capturing the photo
  let streamRef = useRef(null); // To manage the video stream
  const id = useParams().id;
  const navigate = useNavigate();

  useEffect(() => {
    checkMediaDevices();
    return () => {
      // Cleanup stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameraList(videoDevices);
      setCameraCount(videoDevices.length);

      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStatus('working');
      videoStream.getTracks().forEach(track => track.stop());

      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('working');
      audioStream.getTracks().forEach(track => track.stop());

      setIsCompatible(videoDevices.length === 1);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Please allow camera and microphone access');
        setCameraStatus('blocked');
        setMicStatus('blocked');
      } else {
        setError('Error accessing media devices');
        setCameraStatus('error');
        setMicStatus('error');
      }
      setIsCompatible(false);
    }
  };

  const handleCheckCompatibility = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameraList(videoDevices);
      setCameraCount(videoDevices.length);

      if (videoDevices.length > 1) {
        setError('Multiple cameras detected. Please use only one camera for the test.');
        setIsCompatible(false);
      } else if (videoDevices.length === 0) {
        setError('No camera detected. A camera is required for the test.');
        setIsCompatible(false);
      } else {
        setError('');
        setIsCompatible(true);
      }
    } catch (err) {
      setError('Error checking device compatibility');
      setIsCompatible(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedPhotoUrl(dataUrl);
    }
  };

  const handleVerifyFace = async () => {
    // try {
      // Fetch student profile from API
    //   const response = await axiosInstance('/student/auth/getProfile');

    //   const data = response.data;
     
    //   if (data.statusCode === 200 && data.data.student.studentPhoto.secure_url) {
    //     setStudentPhotoUrl(data.data.student.studentPhoto.secure_url);
    //     setError('');

    //     // Start live camera feed
    //     const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    //     streamRef.current = videoStream;
    //     if (videoRef.current) {
    //       videoRef.current.srcObject = videoStream;
    //     }

    //     // Wait for video to load metadata before capturing
    //     videoRef.current.onloadedmetadata = () => {
    //       setTimeout(() => {
    //         capturePhoto(); // Capture the photo after a short delay
    //         setShowFaceComparison(true);

    //         // Simulate face verification
    //         setTimeout(() => {
    //           setIsFaceVerified(true);
    //           setError('Face verified successfully');
    //           setShowFaceComparison(false);
    //           if (streamRef.current) {
    //             streamRef.current.getTracks().forEach(track => track.stop());
    //           }
    //         }, 3000); // Simulate 3-second verification delay
    //       }, 1000); // Delay to ensure video is ready
    //     };
    //   } else {
    //     throw new Error('Student photo not found');
    //   }
    // } 
    // catch (err) {
    //   setError('Failed to verify face. Please try again.');
    //   setIsFaceVerified(false);
    //   setShowFaceComparison(false);
    //   setCapturedPhotoUrl('');
    //   if (streamRef.current) {
    //     streamRef.current.getTracks().forEach(track => track.stop());
    //   }
    // }

    setIsFaceVerified(true);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleFullScreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
      element.msRequestFullscreen();
    }
  };

  const handleStartTest = () => {
    if (inputValue.toLowerCase() !== 'start') {
      setError('Please type "start" in the input field');
      return;
    }

    /*** if the screen is not in full screen mode, then show the error message ***/
    if (!document.fullscreenElement) {
      setError('Please ensure the screen is in full screen mode');
      return;
    }
    

    if (cameraStatus === 'working' && micStatus === 'working' && isCompatible && isFaceVerified) {
      
      setError('');
      navigate(`/exam/view/${id}`);
    } else {
      setError('Please ensure camera, microphone, compatibility, and face verification are completed');
    }
  };

  const rulesAndRegulations = [
    "This is a proctored examination requiring camera and microphone access.",
    "Ensure you are in a quiet, well-lit environment with no distractions.",
    "Only one camera should be connected to your system.",
    "Do not navigate away from the test window during the examination.",
    "Use of additional devices or resources is strictly prohibited.",
    "The test must be completed within the allotted time.",
    "Any suspicious behavior will be flagged and may result in disqualification.",
    "Follow all instructions provided during the test carefully.",
    "Face verification is required before starting the test."
  ];

  if (testStarted) {
    return (
      <div className="w-screen h-screen bg-gray-100 flex flex-col">
        <div className="bg-gray-700 text-white p-4 flex items-center justify-between border-b border-gray-500">
          <span className="text-lg font-semibold">Examination Window</span>
          <div className="flex space-x-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white border border-gray-300 p-8 rounded shadow-sm text-center">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Test Started</h2>
            <p className="text-lg text-gray-600">Your examination is now in progress. Good luck!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gray-700 text-white p-4 flex items-center justify-between border-b border-gray-500">
        <span className="text-lg font-semibold">Examination Setup</span>
        <div className="flex space-x-2">
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-row p-6 gap-6">
        {/* Left Panel: System Status and Camera Details */}
        <div className="w-1/2 bg-white border border-gray-300 rounded shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between bg-gray-50 p-3 border border-gray-200">
              <span className="text-gray-700">Camera:</span>
              <span className={`px-2 py-1 text-sm ${cameraStatus === 'working' ? 'bg-green-200 text-green-800' : cameraStatus === 'blocked' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                {cameraStatus === 'working' ? 'Operational' : cameraStatus === 'blocked' ? 'Blocked' : 'Checking...'}
              </span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 border border-gray-200">
              <span className="text-gray-700">Microphone:</span>
              <span className={`px-2 py-1 text-sm ${micStatus === 'working' ? 'bg-green-200 text-green-800' : micStatus === 'blocked' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                {micStatus === 'working' ? 'Operational' : micStatus === 'blocked' ? 'Blocked' : 'Checking...'}
              </span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 border border-gray-200">
              <span className="text-gray-700">Cameras Detected:</span>
              <span className={`px-2 py-1 text-sm ${cameraCount === 1 ? 'bg-green-200 text-green-800' : cameraCount > 1 ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                {cameraCount} {cameraCount === 1 ? 'Camera' : 'Cameras'}
              </span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 border border-gray-200">
              <span className="text-gray-700">Face Verification:</span>
              <span className={`px-2 py-1 text-sm ${isFaceVerified ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                {isFaceVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>

          {cameraCount > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Camera Details</h3>
              <div className="bg-gray-50 p-3 border border-gray-200">
                <ul className="space-y-2 text-gray-700">
                  {cameraList.map((camera, index) => (
                    <li key={camera.deviceId} className="flex items-center">
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                      {camera.label || `Camera ${index + 1}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Rules and Controls */}
        <div className="w-1/2 bg-white border border-gray-300 rounded shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rules & Regulations</h3>
          <div className="bg-gray-50 p-3 border border-gray-200 mb-6 flex-1 overflow-y-auto">
            <ul className="space-y-2 text-gray-700">
              {rulesAndRegulations.map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2 mt-1"></span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleFullScreen}
              className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Enter Full Screen
            </button>
            <button
              onClick={handleCheckCompatibility}
              className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 transition-colors"
            >
              Verify Compatibility
            </button>
            <button
              onClick={handleVerifyFace}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Verify Face
            </button>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type 'start' to begin"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-700"
              />
              <button
                onClick={handleStartTest}
                className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={cameraStatus !== 'working' || micStatus !== 'working' || !isCompatible || !isFaceVerified}
              >
                Start Test
              </button>
            </div>
            {error && (
              <div className={`text-sm p-2 rounded border ${isFaceVerified ? 'text-green-700 bg-green-100 border-green-300' : 'text-red-700 bg-red-100 border-red-300'}`}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Face Comparison Modal */}
      {showFaceComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Face Verification</h3>
            <div className="flex justify-between mb-4">
              <div className="w-1/2 pr-2">
                <p className="text-gray-700 mb-2">Stored Photo</p>
                {studentPhotoUrl ? (
                  <img src={studentPhotoUrl} alt="Stored Student Photo" className="w-full h-48 object-cover rounded" />
                ) : (
                  <p className="text-gray-500">Loading...</p>
                )}
              </div>
              <div className="w-1/2 pl-2">
                <p className="text-gray-700 mb-2">Captured Photo</p>
                {capturedPhotoUrl ? (
                  <img src={capturedPhotoUrl} alt="Captured Photo" className="w-full h-48 object-cover rounded" />
                ) : (
                  <p className="text-gray-500">Capturing...</p>
                )}
              </div>
            </div>
            <p className="text-gray-600 text-center">Verifying your identity... Please wait.</p>
          </div>
        </div>
      )}

      {/* Hidden Video and Canvas for Capturing */}
      <video ref={videoRef} autoPlay playsInline className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default StartTest;