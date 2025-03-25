import React, { useState } from "react";
import axiosInstance from '../../services/axiosInstance.js';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    universityEmail: "",
    universityPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.universityEmail) newErrors.universityEmail = "universityEmail is required";
    else if (!/\S+@\S+\.\S+/.test(formData.universityEmail)) newErrors.universityEmail = "universityEmail is invalid";
    if (!formData.universityPassword) newErrors.universityPassword = "universityPassword is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post("/university/auth/login", formData);

      if (response.status === 200) {
        toast.success("Login successful!", { autoClose: 2000 });
        localStorage.setItem("examUser", "university");
        setTimeout(() => navigate("/university"), 2000);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error?.response?.data?.message || "Something went wrong!");
      } else {
        toast.error("Network error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotuniversityPassword = () => {
    navigate("/forgotuniversityPassword");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-black w-full max-w-md p-8 rounded-lg shadow-lg border border-gray-800">
        {/* Header */}
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-gray-400 mb-6 text-sm">
          University Login
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* universityEmail Field */}
          <div>
            <label htmlFor="universityEmail" className="block text-sm font-medium text-gray-300 mb-1">
              University Email
            </label>
            <div className="relative">
              <input
                type="email" // Corrected from "universityEmail" to "email"
                id="universityEmail"
                name="universityEmail"
                value={formData.universityEmail}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border ${
                  errors.universityEmail ? "border-red-500" : "border-gray-700"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200`}
                placeholder="you@example.com"
              />
              <i className="fa fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            {errors.universityEmail && (
              <p className="text-red-500 text-xs mt-1">{errors.universityEmail}</p>
            )}
          </div>

          {/* universityPassword Field */}
          <div>
            <label
              htmlFor="universityPassword"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              University Password
            </label>
            <div className="relative">
              <input
                type="password" // Corrected from "universityPassword" to "password"
                id="universityPassword"
                name="universityPassword"
                value={formData.universityPassword}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border ${
                  errors.universityPassword ? "border-red-500" : "border-gray-700"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200`}
                placeholder="••••••"
              />
              <i className="fa fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            {errors.universityPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.universityPassword}</p>
            )}
          </div>

          {/* Forgot universityPassword */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotuniversityPassword}
              className="text-gray-300 hover:text-white hover:underline text-sm font-medium transition-all duration-200"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 text-lg font-semibold rounded-md text-white ${
              isSubmitting
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600"
            } transition-all duration-300`}
          >
            {isSubmitting ? "Logging In..." : "Log In"}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/university/signup" className="text-gray-300 hover:text-white hover:underline font-medium">
            Sign up here
          </Link>
        </div>
      </div>

      {/* Toast Container */}
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
        theme="dark" // Changed to dark theme to match UI
      />
    </div>
  );
};

export default Login;