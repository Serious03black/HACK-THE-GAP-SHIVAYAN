import React, { useState } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(''); // Clear error as user types
  };

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email must contain "@" and a valid domain');
      return false;
    }

    if (!/\.(com|edu|org|net)$/i.test(email)) {
      setError('Email must end with .com, .edu, .org, or .net');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post('user/forgotpassword', { email });

      if (response.status === 200) {
        toast.success('Check your inbox for password reset instructions!', {
          autoClose: 2000,
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
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
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-8">Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-semibold">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                className={`w-full p-4 mt-2 border-2 ${
                  error ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ease-in-out hover:shadow-lg`}
                placeholder="example@gmail.com"
              />
              <i className="fa fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 text-lg"></i>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Submit Button */}
          <div className="mb-6 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`cursor-pointer w-full py-3 text-lg font-semibold rounded-lg text-white ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              } transition duration-300 flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Password Reset Email'
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Remember your password?{' '}
            <a href="/login" className="text-purple-600 hover:underline">
              Login here
            </a>
          </p>
        </div>
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
        toastClassName="rounded-lg shadow-lg bg-white text-gray-800 border border-purple-200"
      />
    </div>
  );
};

export default ForgotPassword;