import React, { useState } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!email) {
      setError('Email is required');
      return;
    } else {
      setError('');
    }

    setIsSubmitting(true);

    try {
      // Make POST request to forgot password API
      const response = await axiosInstance.post('/university/forgotpassword', { email });

      if (response.status === 200) {
        // On successful request
        toast.success('Check your inbox for password reset instructions!');
        setTimeout(() => {
          navigate('/login'); // Redirect to login page after success
        }, 2000);
      }
    } catch (error) {
      // Handle error response from the server
      if (error.response) {
        toast.error(error?.response?.data?.message || 'Something went wrong!');
      } else {
        toast.error('Network error. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 min-h-screen flex justify-center items-center py-16 px-6">
      <div className="bg-white w-full sm:w-3/4 md:w-1/2 lg:w-1/3 p-8 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-8">University Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-semibold">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              className={`w-full p-4 mt-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ease-in-out hover:shadow-lg ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Submit Button */}
          <div className="mb-6 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`cursor-pointer w-full py-3 text-lg font-semibold rounded-lg text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} transition duration-300`}
            >
              {isSubmitting ? 'Sending...' : 'Send Password Reset Email'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Remember your password? <a href="/login" className="text-purple-600 hover:underline">Login here</a></p>
        </div>
      </div>

      {/* Toast container for showing notifications */}
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
