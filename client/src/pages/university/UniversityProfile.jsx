import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import toast, { Toaster } from 'react-hot-toast';

const UniversityProfile = () => {
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUniversityDetails();
  }, []);

  const fetchUniversityDetails = async () => {
    try {
      setLoading(true);
      toast.loading('Fetching university details...');
      const response = await axiosInstance.get('/university/auth/getuniversityDetails');
      if (response.data.statusCode === 200) {
        setUniversity(response.data.data.university); // Access nested university object
        toast.dismiss();
        toast.success('University details loaded!');
      } else {
        throw new Error(response.data.message || 'Failed to fetch university details');
      }
    } catch (error) {
      console.error('Error fetching university details:', error);
      toast.dismiss();
      toast.error('Failed to load university details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/university/dashboard');
  };

  const sidebarItems = [
    { name: 'Dashboard', path: '/university/dashboard' },
    { name: 'Exams', path: '/university/exams' },
    { name: 'Students', path: '/university/students' },
    { name: 'Profile', path: '/university/profile', active: true },
  ];

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 to-green-100 min-h-screen">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#10B981',
            color: '#fff',
            borderRadius: '8px',
          },
          success: { style: { background: '#10B981' } },
          error: { style: { background: '#EF4444' } },
        }}
      />

      {/* Fixed Sidebar (Full Height, No Gap) */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-64 bg-gradient-to-b from-green-600 to-green-700 text-white transition-transform duration-300 ease-in-out z-20 shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="pt-16 p-6 border-b border-green-500">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`p-4 cursor-pointer ${
                item.active ? 'bg-yellow-500 text-green-900' : 'hover:bg-green-500'
              } transition-all duration-200`}
            >
              {item.name}
            </div>
          ))}
          <div
            onClick={handleLogout}
            className="p-4 cursor-pointer hover:bg-green-500 transition-all duration-200"
          >
            Logout
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 z-30 w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Scrollable Main Content */}
      <div className="flex-1 ml-0 md:ml-64 pt-16 overflow-y-auto min-h-screen">
        <div className="p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-green-700 hover:text-green-800 transition-all duration-200"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>

            {/* Header */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-green-700 tracking-tight">
              University Profile
            </h1>

            {/* University Details */}
            <div className="bg-white rounded-xl shadow-2xl p-6">
              {loading ? (
                <p className="text-center text-gray-600">Loading university details...</p>
              ) : university ? (
                <div className="space-y-6">
                  {/* University Banner */}
                  <div className="w-full">
                    <img
                      src={university.universityLogo.secure_url}
                      alt="University Banner"
                      className="w-full h-48 object-cover rounded-lg border-2 border-green-500 shadow-md"
                    />
                  </div>

                  {/* University Info */}
                  <div className="space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-green-700">
                      {university.universityName}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <p className="text-gray-700">
                        <span className="font-medium text-green-700">Email:</span>{' '}
                        {university.universityEmail}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium text-green-700">Phone:</span>{' '}
                        {university.universityPhone}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium text-green-700">Address:</span>{' '}
                        {university.universityAddress}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium text-green-700">Created:</span>{' '}
                        {formatDate(university.createdAt)}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium text-green-700">Last Updated:</span>{' '}
                        {formatDate(university.updatedAt)}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium text-green-700">ID:</span>{' '}
                        {university._id}
                      </p>
                    </div>

                    {/* Edit Profile Button */}
                    <button
                      onClick={() => navigate('/university/profile/edit')} // Placeholder for edit route
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-600">No university data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityProfile;