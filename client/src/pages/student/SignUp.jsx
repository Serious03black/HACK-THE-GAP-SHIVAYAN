import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import * as tf from "@tensorflow/tfjs";
import { createDetector, SupportedModels } from "@tensorflow-models/face-detection";
import { extractErrorMessage } from './../../components/customError';

const Signup = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    studentPassword: "",
    studentPhone: "",
    photo: null,
  });

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [detector, setDetector] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isDetectingFace, setIsDetectingFace] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Load TensorFlow.js and face detection model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        await tf.setBackend('webgl');
        await tf.ready();
        console.log("TensorFlow.js backend:", tf.getBackend());

        const model = SupportedModels.MediaPipeFaceDetector;
        const detectorConfig = {
          runtime: "tfjs",
          modelType: "short",
          maxFaces: 10, // Allow detection of multiple faces
        };
        const faceDetector = await createDetector(model, detectorConfig);
        setDetector(faceDetector);
        toast.success("Face detection model loaded!");
        console.log("Face detector initialized:", faceDetector);
      } catch (error) {
        console.error("Error loading face detection model:", error);
        toast.error("Failed to load face detection model.");
      } finally {
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const startCamera = async () => {
    if (isModelLoading) {
      toast.error("Please wait, model is loading...");
      return;
    }
    if (!detector) {
      toast.error("Face detection model not loaded.");
      return;
    }
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Camera stream loaded:", videoRef.current.videoWidth, videoRef.current.videoHeight);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera.");
      setCameraActive(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera or canvas not ready.");
      return;
    }

    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const imageData = canvasRef.current.toDataURL("image/png");

    console.log("Captured image data:", imageData.substring(0, 50));
    stopCamera();
    setIsDetectingFace(true);

    const currentFile = base64ToFile(imageData, "captured_image.png");
    setFile(currentFile);

    await detectFace(imageData);
  };

  const base64ToFile = (base64String, fileName) => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  const stopCamera = () => {
    setCameraActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const detectFace = async (imageData) => {
    if (!detector) {
      toast.error("Face detection model not loaded.");
      setIsDetectingFace(false);
      return;
    }

    try {
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => (img.onload = () => {
        console.log("Image loaded:", img.width, img.height);
        resolve();
      }));

      const tensor = tf.browser.fromPixels(img);
      console.log("Tensor shape:", tensor.shape);
      const detections = await detector.estimateFaces(tensor, { flipHorizontal: false });
      console.log("Detected faces:", detections);
      tf.dispose(tensor);

      if (detections.length === 0) {
        toast.error("No faces detected. Please retake the picture.");
        setImagePreview(null);
        setFormData({ ...formData, photo: null });
        setFile(null);
      } else if (detections.length > 1) {
        toast.error(`Multiple faces detected (${detections.length}). Please capture only one face.`);
        setImagePreview(null);
        setFormData({ ...formData, photo: null });
        setFile(null);
      } else {
        toast.success("Single face detected successfully!");
        setImagePreview(imageData);
        setFormData({ ...formData, photo: imageData });
      }
    } catch (error) {
      console.error("Face detection error:", error);
      toast.error("Failed to detect faces.");
      setImagePreview(null);
      setFormData({ ...formData, photo: null });
      setFile(null);
    } finally {
      setIsDetectingFace(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.studentName) newErrors.studentName = "Full Name is required";
    if (!formData.studentEmail) newErrors.studentEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.studentEmail)) newErrors.studentEmail = "Email is invalid";
    if (!formData.studentPassword) newErrors.studentPassword = "Password is required";
    else if (formData.studentPassword.length < 6) newErrors.studentPassword = "Password must be at least 6 characters";
    if (!formData.studentPhone) newErrors.studentPhone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.studentPhone)) newErrors.studentPhone = "Invalid phone number (10 digits)";
    if (!formData.photo) newErrors.photo = "A photo with a single face is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("studentName", formData.studentName);
    formDataToSend.append("studentEmail", formData.studentEmail);
    formDataToSend.append("studentPassword", formData.studentPassword);
    formDataToSend.append("studentPhone", formData.studentPhone);

    if (file instanceof File) {
      formDataToSend.append("photo", file);
    } else {
      toast.error("Invalid photo format. Please capture again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axiosInstance.post(`/student/auth/register`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        toast.success("Signup successful!", { autoClose: 2000 });
        setTimeout(() => navigate("/student/login"), 1000);
      }
    } catch (error) {
      const message = extractErrorMessage(error?.response?.data) || "Something went wrong!";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl border border-green-100 transform transition-all hover:scale-[1.02]">
        <h2 className="text-4xl font-extrabold text-green-600 text-center mb-2">Join Now</h2>
        <p className="text-center text-gray-600 mb-8 font-medium">Student Signup Portal</p>

        {isModelLoading ? (
          <div className="flex flex-col items-center mb-6">
            <svg className="animate-spin h-12 w-12 text-green-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600 mt-4 font-medium">Loading face detection model...</p>
          </div>
        ) : (
          <>
            {isDetectingFace ? (
              <div className="flex flex-col items-center mb-6">
                <svg className="animate-spin h-12 w-12 text-green-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-600 mt-4 font-medium">Detecting face...</p>
              </div>
            ) : imagePreview ? (
              <div className="flex justify-center mb-6">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-md"
                />
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="studentName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 border-2 ${
                      errors.studentName ? "border-red-400" : "border-green-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-green-500 transition-all duration-300`}
                    placeholder="John Doe"
                  />
                  <i className="fa fa-user absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg"></i>
                </div>
                {errors.studentName && (
                  <p className="text-red-500 text-xs mt-2 font-medium">{errors.studentName}</p>
                )}
              </div>

              <div>
                <label htmlFor="studentEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="studentEmail"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 border-2 ${
                      errors.studentEmail ? "border-red-400" : "border-green-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-green-500 transition-all duration-300`}
                    placeholder="student@example.com"
                  />
                  <i className="fa fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg"></i>
                </div>
                {errors.studentEmail && (
                  <p className="text-red-500 text-xs mt-2 font-medium">{errors.studentEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="studentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="studentPassword"
                    name="studentPassword"
                    value={formData.studentPassword}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 border-2 ${
                      errors.studentPassword ? "border-red-400" : "border-green-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-green-500 transition-all duration-300`}
                    placeholder="••••••••"
                  />
                  <i className="fa fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg"></i>
                </div>
                {errors.studentPassword && (
                  <p className="text-red-500 text-xs mt-2 font-medium">{errors.studentPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="studentPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="studentPhone"
                    name="studentPhone"
                    value={formData.studentPhone}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 border-2 ${
                      errors.studentPhone ? "border-red-400" : "border-green-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-green-500 transition-all duration-300`}
                    placeholder="1234567890"
                  />
                  <i className="fa fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg"></i>
                </div>
                {errors.studentPhone && (
                  <p className="text-red-500 text-xs mt-2 font-medium">{errors.studentPhone}</p>
                )}
              </div>

              <button
                type="button"
                onClick={startCamera}
                disabled={isModelLoading || isDetectingFace}
                className={`w-full py-3 text-lg font-bold rounded-lg text-white ${
                  isModelLoading || isDetectingFace
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                } shadow-md hover:shadow-lg transition-all duration-300`}
              >
                Take Picture
              </button>

              {cameraActive && (
                <div className="space-y-4">
                  <video ref={videoRef} autoPlay className="w-full rounded-lg border-2 border-green-300" />
                  <button
                    type="button"
                    onClick={captureImage}
                    className="w-full py-3 text-lg font-bold rounded-lg text-white bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Capture
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
              {errors.photo && (
                <p className="text-red-500 text-xs mt-2 font-medium">{errors.photo}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isModelLoading || isDetectingFace}
                className={`w-full py-3 text-lg font-bold rounded-lg text-white ${
                  isSubmitting || isModelLoading || isDetectingFace
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                } shadow-md hover:shadow-lg transition-all duration-300`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing Up...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-lg shadow-lg bg-white text-gray-800 border border-green-200"
      />
    </div>
  );
};

export default Signup;