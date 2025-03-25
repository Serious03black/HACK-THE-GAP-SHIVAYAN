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
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.success("University registration successful!", { autoClose: 2000 });
        setTimeout(() => navigate("/university/login"), 2000);
      }
    } catch (error) {
      toast.error(extractErrorMessage(error?.response?.data) || "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl border border-green-100 transform transition-all hover:scale-[1.02]">
        {/* Header */}
        <h2 className="text-4xl font-extrabold text-green-600 text-center mb-2">
          University Registration
        </h2>
        <p className="text-center text-gray-600 mb-8 font-medium">
          Create your university account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* University Name Field */}
          <div>
            <label htmlFor="universityName" className="block text-sm font-semibold text-gray-700 mb-2">
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
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 border-2 ${
                  errors.universityName ? "border-red-400" : "border-green-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-green-500 transition-all duration-300`}
                placeholder="BAMU"
              />
              <i className="fa fa-university absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg"></i>
            </div>
            {errors.universityName && (
              <p className="text-red-500 text-xs mt-2 font-medium">{errors.universityName}</p>
            )}
          </div>

          {/* University Email Field */}
          <div>
            <label htmlFor="universityEmail" className="block text-sm font-semibold text-gray-700 mb-2">
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
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 border-2 ${
                  errors.universityEmail ? "border-red-400" : "border-green-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-green-500 transition-all duration-300`}
                placeholder="bamu@gmail.com"
              />
              <i className="fa fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg"></i>
            </div>
            {errors.universityEmail && (
              <p className="text-red-500 text-xs mt-2 font-medium">{errors.universityEmail}</p>
            )}
          </div>

          {/* University Address Field */}
          <div>
            <label htmlFor="universityAddress" className="block text-sm font-semibold text-gray-700 mb-2">
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
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 border-2 ${
                  errors.universityAddress ? "border-red-400" : "border-green-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-green-500 transition-all duration-300`}
                placeholder="At Sambajinagar"
              />
              <i className="fa fa-map-marker absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg"></i>
            </div>
            {errors.universityAddress && (
              <p className="text-red-500 text-xs mt-2 font-medium">{errors.universityAddress}</p>
            )}
          </div>

          {/* University Phone Field */}
          <div>
            <label htmlFor="universityPhone" className="block text-sm font-semibold text-gray-700 mb-2">
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
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 border-2 ${
                  errors.universityPhone ? "border-red-400" : "border-green-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-green-500 transition-all duration-300`}
                placeholder="8767482793"
              />
              <i className="fa fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg"></i>
            </div>
            {errors.universityPhone && (
              <p className="text-red-500 text-xs mt-2 font-medium">{errors.universityPhone}</p>
            )}
          </div>

          {/* University Password Field */}
          <div>
            <label htmlFor="universityPassword" className="block text-sm font-semibold text-gray-700 mb-2">
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
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-800 border-2 ${
                  errors.universityPassword ? "border-red-400" : "border-green-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-green-500 transition-all duration-300`}
                placeholder="••••••••"
              />
              <i className="fa fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg"></i>
            </div>
            {errors.universityPassword && (
              <p className="text-red-500 text-xs mt-2 font-medium">{errors.universityPassword}</p>
            )}
          </div>

          {/* Logo Field */}
          <div>
            <label htmlFor="logo" className="block text-sm font-semibold text-gray-700 mb-2">
              University Logo
            </label>
            <div className="relative">
              <input
                type="file"
                id="logo"
                name="logo"
                onChange={handleChange}
                accept="image/*"
                className={`w-full py-3 pl-12 bg-gray-50 text-gray-800 border-2 ${
                  errors.logo ? "border-red-400" : "border-green-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-green-500 transition-all duration-300`}
              />
              <i className="fa fa-camera absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg"></i>
            </div>
            {errors.logo && (
              <p className="text-red-500 text-xs mt-2 font-medium">{errors.logo}</p>
            )}
            {formData.logo && (
              <p className="text-gray-600 text-xs mt-2 font-medium">Selected: {formData.logo.name}</p>
            )}
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
                Registering...
              </span>
            ) : (
              "Register University"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 font-medium">Already have an account? </span>
          <Link to="/university/login" className="text-yellow-500 hover:text-yellow-600 hover:underline font-semibold transition-all duration-200">
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
        theme="light"
        toastClassName="rounded-lg shadow-lg bg-white text-gray-800 border border-green-200"
      />
    </div>
  );
};

export default Signup;