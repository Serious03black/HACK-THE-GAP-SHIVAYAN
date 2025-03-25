import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../../services/axiosInstance';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    studentId: '',
    enrollmentDate: '',
    course: '', // Note: Course isn't in the API response, keeping it for UI
    profilePicture: '',
    phone: '' // Added phone since it's in the response
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/student/auth/getProfile');
      const apiData = response?.data?.data?.student || {};
      
      // Map API response to our state structure
      setStudentData({
        name: apiData.studentName || '',
        email: apiData.studentEmail || '',
        studentId: apiData._id || '',
        enrollmentDate: apiData.createdAt ? new Date(apiData.createdAt).toLocaleDateString() : '',
        course: apiData.course || 'N/A', // Course not in API response, keeping as N/A
        profilePicture: apiData.studentPhoto?.secure_url || '',
        phone: apiData.studentPhone || ''
      });
      
      toast.success('Profile loaded successfully!');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const sidebarItems = [
    { name: 'Dashboard', path: '/student/dashboard' },
    { name: 'myExams', path: '/student/myExams' }, // Changed 'myExams' to 'Exams' for consistency
    { name: 'Profile', path: '/student/profile', active: true },
    { name: 'Exam History', path: '/student/exam-history' },
    { name: 'Settings', path: '/student/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-green-800 text-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-6 border-b border-green-700">
          <h2 className="text-2xl font-bold text-white">Student Portal</h2>
          <p className="text-sm text-green-200">Welcome Back!</p>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`p-4 cursor-pointer ${
                item.active ? 'bg-green-600' : 'hover:bg-green-700'
              } transition-colors flex items-center space-x-2`}
            >
              <span>{item.name}</span>
            </div>
          ))}
          <div
            onClick={handleLogout}
            className="p-4 cursor-pointer hover:bg-green-700 transition-colors flex items-center space-x-2 absolute bottom-4 w-full"
          >
            <span>Logout</span>
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden p-4 bg-green-800 text-white fixed top-0 left-0 z-30 w-full flex justify-between items-center">
        <h2 className="text-xl font-bold">Student Portal</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 mt-16 md:mt-0">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={studentData.profilePicture || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
              />
              <div className="absolute bottom-0 right-0 bg-green-600 rounded-full p-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.035-2.035.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800">{studentData.name || 'Student Name'}</h1>
              <p className="text-gray-600 mt-1">{studentData.email || 'student@example.com'}</p>
              <button
                onClick={() => toast.success('Edit profile feature coming soon!')}
                className="cursor-pointer mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-all"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Details</h2>
            {loading ? (
              <p className="text-gray-600">Loading profile...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-600 font-medium">Student ID</label>
                    <p className="text-gray-800">{studentData.studentId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Enrollment Date</label>
                    <p className="text-gray-800">{studentData.enrollmentDate || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Phone</label>
                    <p className="text-gray-800">{studentData.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-600 font-medium">Course</label>
                    <p className="text-gray-800">{studentData.course || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Status</label>
                    <p className="text-green-600 font-medium">Active</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-600 font-medium">Last Login</label>
                <p className="text-gray-800">{new Date().toLocaleString()}</p>
              </div>
              <div>
                <label className="text-gray-600 font-medium">Completed Exams</label>
                <p className="text-gray-800">View in Exam History</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;