import React, { useState } from "react";
import axiosInstance from "../../services/axiosInstance.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import { extractErrorMessage } from "../../components/customError";

const Signup = () => {
  const [formData, setFormData] = useState({
    universityName: "",
    universityEmail: "",
    universityAddress: "",
    universityPhone: "",
    universityPassword: "",
    logo: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo" && files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.universityName) newErrors.universityName = "University Name is required";
    if (!formData.universityEmail) newErrors.universityEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.universityEmail))
      newErrors.universityEmail = "Email is invalid";
    if (!formData.universityAddress) newErrors.universityAddress = "Address is required";
    if (!formData.universityPhone) newErrors.universityPhone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.universityPhone))
      newErrors.universityPhone = "Phone must be a 10-digit number";
    if (!formData.universityPassword) newErrors.universityPassword = "Password is required";
    else if (formData.universityPassword.length < 6)
      newErrors.universityPassword = "Password must be at least 6 characters";
    if (formData.logo && formData.logo.size > 2 * 1024 * 1024)
      newErrors.logo = "Logo must be less than 2MB";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const data = new FormData();
    data.append("universityName", formData.universityName);
    data.append("universityEmail", formData.universityEmail);
    data.append("universityAddress", formData.universityAddress);
    data.append("universityPhone", formData.universityPhone);
    data.append("universityPassword", formData.universityPassword);
    if (formData.logo) {
      data.append("logo", formData.logo);
    }

    try {
      const response = await axiosInstance.post(`/university/auth/register`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("University registration successful!", { autoClose: 2000 });
        setTimeout(() => navigate("/university/login"), 2000);
      }
    } catch (error) {
      if (error.response) {
        toast.error(extractErrorMessage(error?.response?.data) || "Something went wrong!");
      } else {
        toast.error("Network error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-black w-full max-w-md p-8 rounded-lg shadow-lg border border-gray-800">
        {/* Header */}
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          University Registration
        </h2>
        <p className="text-center text-gray-400 mb-6 text-sm">
          Register your university to get started!
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* University Name Field */}
          <div>
            <label
              htmlFor="universityName"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              University Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="universityName"
                name="universityName"
                value={formData.universityName}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border ${
                  errors.universityName ? "border-red-500" : "border-gray-700"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200`}
                placeholder="BAMU"
              />
              <i className="fa fa-university absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            {errors.universityName && (
              <p className="text-red-500 text-xs mt-1">{errors.universityName}</p>
            )}
          </div>

          {/* University Email Field */}
          <div>
            <label
              htmlFor="universityEmail"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              University Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="universityEmail"
                name="universityEmail"
                value={formData.universityEmail}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border ${
                  errors.universityEmail ? "border-red-500" : "border-gray-700"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200`}
                placeholder="bamu@gmail.com"
              />
              <i className="fa fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            {errors.universityEmail && (
              <p className="text-red-500 text-xs mt-1">{errors.universityEmail}</p>
            )}
          </div>

          {/* University Address Field */}
          <div>
            <label
              htmlFor="universityAddress"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              University Address
            </label>
            <div className="relative">
              <input
                type="text"
                id="universityAddress"
                name="universityAddress"
                value={formData.universityAddress}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border ${
                  errors.universityAddress ? "border-red-500" : "border-gray-700"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200`}
                placeholder="At Sambajinagar"
              />
              <i className="fa fa-map-marker absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            {errors.universityAddress && (
              <p className="text-red-500 text-xs mt-1">{errors.universityAddress}</p>
            )}
          </div>

          {/* University Phone Field */}
          <div>
            <label
              htmlFor="universityPhone"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              University Phone
            </label>
            <div className="relative">
              <input
                type="text"
                id="universityPhone"
                name="universityPhone"
                value={formData.universityPhone}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border ${
                  errors.universityPhone ? "border-red-500" : "border-gray-700"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200`}
                placeholder="8767482793"
              />
              <i className="fa fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            {errors.universityPhone && (
              <p className="text-red-500 text-xs mt-1">{errors.universityPhone}</p>
            )}
          </div>

          {/* University Password Field */}
          <div>
            <label
              htmlFor="universityPassword"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type="password"
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

          {/* Logo Field */}
          <div>
            <label
              htmlFor="logo"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              University Logo
            </label>
            <div className="relative">
              <input
                type="file"
                id="logo"
                name="logo"
                onChange={handleChange}
                accept="image/*"
                className={`w-full py-3 bg-gray-800 text-gray-100 border ${
                  errors.logo ? "border-red-500" : "border-gray-700"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200`}
              />
              <i className="fa fa-camera absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            {errors.logo && (
              <p className="text-red-500 text-xs mt-1">{errors.logo}</p>
            )}
            {formData.logo && (
              <p className="text-gray-400 text-xs mt-1">
                Selected: {formData.logo.name}
              </p>
            )}
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
            {isSubmitting ? "Registering..." : "Register University"}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/university/login"
            className="text-gray-300 hover:text-white hover:underline font-medium"
          >
            Log in here
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

export default Signup;