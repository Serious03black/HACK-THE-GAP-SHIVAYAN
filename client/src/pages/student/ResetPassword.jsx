import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams(); // Get the token from URL parameters
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    if (!token) {
      // If no token is found in URL, show an error message
      toast.error('Invalid reset link.');
    //   navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Make POST request to reset the password
      const response = await axiosInstance.post(   
        `student/resetPassword/${token}`,
        { password: formData.password }
      );

      if (response.status === 200) {
        // On successful password reset
        toast.success('Password has been successfully reset!');
        setTimeout(() => {
          navigate('/login'); // Redirect to login page after success
        }, 2000); // Delay to show the success message
      }
    } catch (error) {
      // Handle error response from the server
      if (error.response) {
        // Server error
        toast.error(error?.response?.data?.message || 'Something went wrong!');
      } else {
        // Network or other error
        toast.error('Network error. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 min-h-screen flex justify-center items-center py-16 px-6">
      <div className="bg-white w-full sm:w-3/4 md:w-1/2 lg:w-1/3 p-8 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-8">Reset Password</h2>

        <form onSubmit={handleSubmit}>
          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-semibold">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full p-4 mt-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ease-in-out hover:shadow-lg ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full p-4 mt-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ease-in-out hover:shadow-lg ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <div className="mb-6 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 text-lg font-semibold rounded-lg text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} transition duration-300`}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Remembered your password? <a href="/login" className="text-purple-600 hover:underline">Login here</a></p>
        </div>
      </div>

      {/* Toast container for showing notifications */}
      <ToastContainer />
    </div>
  );
};

export default ResetPassword;
