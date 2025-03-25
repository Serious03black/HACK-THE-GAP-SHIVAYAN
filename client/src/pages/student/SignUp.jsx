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
  const [isDetectingFace, setIsDetectingFace] = useState(false); // New state for face detection loading
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Load TensorFlow.js face detection model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        await tf.ready();
        const model = SupportedModels.MediaPipeFaceDetector;
        const detectorConfig = {
          runtime: "tfjs",
          modelType: "short",
        };
        const faceDetector = await createDetector(model, detectorConfig);
        setDetector(faceDetector);
        console.log("Face detection model loaded successfully");
      } catch (error) {
        console.error("Error loading face detection model:", error);
        toast.error("Failed to load face detection model");
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
      toast.error("Please wait, face detection model is still loading...");
      return;
    }
    if (!detector) {
      toast.error("Face detection model failed to load. Please refresh the page.");
      return;
    }
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera");
      setCameraActive(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref is null");
      return;
    }
  
    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const imageData = canvasRef.current.toDataURL("image/png");
  
    console.log("Captured image data:", imageData.substring(0, 50));
    stopCamera();
    setIsDetectingFace(true); // Start face detection loader
  
    // Convert base64 to File
    const currentFile = base64ToFile(imageData, "captured_image.png");

    setFile(currentFile);

    await detectFace(imageData);
  };
  
  // Helper function to convert base64 to File
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
      toast.error("Face detection model not loaded yet. Please try again.");
      setIsDetectingFace(false);
      return;
    }

    try {
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => (img.onload = resolve));

      const tensor = tf.browser.fromPixels(img);
      const detections = await detector.estimateFaces(tensor);
      tf.dispose(tensor);

      console.log("Detections:", detections);

      if (detections.length > 0) {
        setImagePreview(imageData);
        setFormData({ ...formData, photo: imageData });
        toast.success("Face detected successfully!");
      } else {
        toast.error("No human face detected. Please retake the picture.");
        setImagePreview(null);
        setFormData({ ...formData, photo: null });
      }
    } catch (error) {
      console.error("Error detecting face:", error);
      toast.error("Failed to detect face. Please try again.");
      setImagePreview(null);
      setFormData({ ...formData, photo: null });
    } finally {
      setIsDetectingFace(false); // Stop face detection loader
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
    else if (!/^\d{10}$/.test(formData.studentPhone)) newErrors.studentPhone = "Invalid phone number (10 digits required)";
    if (!formData.photo) newErrors.photo = "A photo with a human face is required";
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

  console.log(" File => ", file);

  // Ensure photo is a File before appending
  if (file instanceof File) {
    formDataToSend.append("photo", file);
  } 
  else {
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
    } 
    catch (error) {
      const message = extractErrorMessage(error?.response?.data) || "Something went wrong!";
      toast.error(message || "Something went wrong!");
    } 
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-900">
      <div className="bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Join Now</h2>
        {isModelLoading ? (
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">Please wait... Loading face detection model</p>
          </div>
        ) : (
          <>
            {isDetectingFace ? (
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white mt-4">Detecting face... Please wait</p>
              </div>
            ) : imagePreview ? (
              <div className="flex justify-center mb-6">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500"
                />
              </div>
            ) : null}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  name="studentName"
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                />
                {errors.studentName && <p className="text-red-400 text-sm mt-1">{errors.studentName}</p>}
              </div>

              <div>
                <input
                  type="email"
                  name="studentEmail"
                  placeholder="Email"
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                />
                {errors.studentEmail && <p className="text-red-400 text-sm mt-1">{errors.studentEmail}</p>}
              </div>

              <div>
                <input
                  type="password"
                  name="studentPassword"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                />
                {errors.studentPassword && <p className="text-red-400 text-sm mt-1">{errors.studentPassword}</p>}
              </div>

              <div>
                <input
                  type="text"
                  name="studentPhone"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                />
                {errors.studentPhone && <p className="text-red-400 text-sm mt-1">{errors.studentPhone}</p>}
              </div>

              <button
                type="button"
                onClick={startCamera}
                disabled={isModelLoading || isDetectingFace} // Disable while detecting
                className={`w-full p-3 text-white rounded-lg transition-colors ${
                  isModelLoading || isDetectingFace
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Take Picture
              </button>

              {cameraActive && (
                <div className="space-y-2">
                  <video ref={videoRef} autoPlay className="w-full rounded-lg" />
                  <button
                    type="button"
                    onClick={captureImage}
                    className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Capture
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden"></canvas>
              {errors.photo && <p className="text-red-400 text-sm mt-1">{errors.photo}</p>}

              <button
                type="submit"
                disabled={isSubmitting || isModelLoading || isDetectingFace} // Disable while detecting
                className={`w-full p-3 text-white rounded-lg transition-colors ${
                  isSubmitting || isModelLoading || isDetectingFace
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isSubmitting ? "Signing Up..." : "Sign Up"}
              </button>
            </form>
          </>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastClassName="bg-gray-800 text-white"
      />
    </div>
  );
};

export default Signup;