// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// Assuming we'll add some graph component (you can replace with actual charting library)
const StudentDashboard = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

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
          {['Dashboard', 'myExams', 'Profile', 'Exam History', 'Settings'].map((item) => (
            <div
              key={item}
              onClick={() => navigate(`/student/${item.toLowerCase().replace(' ', '-')}`)}
              className={`p-4 cursor-pointer ${
                item === 'Dashboard' ? 'bg-green-600' : 'hover:bg-green-700'
              } transition-colors flex items-center space-x-2`}
            >
              <span>{item}</span>
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
          <div className="bg-white rounded-lg shadow-lg p-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <button
              onClick={() => navigate('/student/profile')}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-md transition-all"
            >
              Profile
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Performance Overview</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div>
                {/* Add your graph components here */}
                <p className="text-gray-600">Your performance metrics will be displayed here</p>
                {/* Example placeholder for graphs */}
                <div className="h-64 bg-gray-100 rounded-md mt-4 flex items-center justify-center">
                  <span>Graph Placeholder (e.g., Chart.js or Recharts)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;