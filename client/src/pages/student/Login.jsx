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
        studentEmail: formData.studentEmail || undefined,
        studentPhone: formData.studentPhone || undefined,
        studentPassword: formData.studentPassword,
      });

      if (response.status === 200) {
        toast.success("Login successful!", { autoClose: 2000 });
        localStorage.setItem("examUser", "student");
<<<<<<< HEAD
        setTimeout(() => window.location.href = "/student/dashboard",1000);
=======
        setTimeout(() => (window.location.href = "/"), 2000);
>>>>>>> 43412faa28c673ca9c5f275c4963a06c749acbcf
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => navigate("/forgotpassword");

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl border border-green-100 transform transition-all hover:scale-[1.02]">
        {/* Header */}
        <h2 className="text-4xl font-extrabold text-green-600 text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mb-8 font-medium">
          Student Login Portal
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="studentEmail" className="block text-sm font-semibold text-gray-700 mb-2">
              Email (optional)
            </label>
            <div className="relative">
              <input
                type="email"
                id="studentEmail"
                name="studentEmail"
                value={formData.studentEmail}
                onChange={handleChange}
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

          {/* Phone Field */}
          <div>
            <label htmlFor="studentPhone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number (optional)
            </label>
            <div className="relative">
              <input
                type="text"
                id="studentPhone"
                name="studentPhone"
                value={formData.studentPhone}
                onChange={handleChange}
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
            {errors.loginField && (
              <p className="text-red-500 text-xs mt-2 font-medium">{errors.loginField}</p>
            )}
          </div>

          {/* Password Field */}
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

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-green-600 hover:text-green-800 hover:underline text-sm font-semibold transition-all duration-200"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 text-lg font-bold rounded-lg text-white ${
              isSubmitting
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
                Logging In...
              </span>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 font-medium">Don’t have an account? </span>
          <Link to="/student/signup" className="text-yellow-500 hover:text-yellow-600 hover:underline font-semibold transition-all duration-200">
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
        theme="light"
        toastClassName="rounded-lg shadow-lg bg-white text-gray-800 border border-green-200"
      />
    </div>
  );
};

export default Login;