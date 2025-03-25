import React, { useState } from "react";
import axiosInstance from "../../services/axiosInstance.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    studentEmail: "",
    studentPhone: "",
    studentPassword: "",
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
    if (!formData.studentEmail && !formData.studentPhone) {
      newErrors.loginField = "Email or Phone number is required";
    } else if (formData.studentEmail && !/\S+@\S+\.\S+/.test(formData.studentEmail)) {
      newErrors.studentEmail = "Email is invalid";
    } else if (formData.studentPhone && !/^\d{10}$/.test(formData.studentPhone)) {
      newErrors.studentPhone = "Phone number must be 10 digits";
    }
    if (!formData.studentPassword) newErrors.studentPassword = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post("/student/auth/login", {
        studentEmail: formData.studentEmail || undefined, // Send only if provided
        studentPhone: formData.studentPhone || undefined, // Send only if provided
        studentPassword: formData.studentPassword,
      });

      if (response.status === 200) {
        toast.success("Login successful!", { autoClose: 2000 });
        localStorage.setItem("examUser", "student");
        setTimeout(() => window.location.href = "/student/dashboard", 2000);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error?.response?.data?.message || "Login failed!");
      } else {
        toast.error("Network error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgotpassword");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-900">
      <div className="bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Welcome Back</h2>
        <p className="text-center text-gray-400 mb-6">Log in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <input
              type="email"
              name="studentEmail"
              placeholder="Email (optional)"
              value={formData.studentEmail}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />
            {errors.studentEmail && (
              <p className="text-red-400 text-sm mt-1">{errors.studentEmail}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <input
              type="text"
              name="studentPhone"
              placeholder="Phone Number (optional)"
              value={formData.studentPhone}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />
            {errors.studentPhone && (
              <p className="text-red-400 text-sm mt-1">{errors.studentPhone}</p>
            )}
            {errors.loginField && (
              <p className="text-red-400 text-sm mt-1">{errors.loginField}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              name="studentPassword"
              placeholder="Password"
              value={formData.studentPassword}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />
            {errors.studentPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.studentPassword}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-3 text-white rounded-lg transition-colors ${
              isSubmitting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isSubmitting ? "Logging In..." : "Log In"}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/student/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign up here
          </Link>
        </div>
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

export default Login;